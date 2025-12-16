import { action, computed, makeObservable, observable } from 'mobx';
import { api_base } from '@/external/bot-skeleton';
import { localize } from '@deriv-com/translations';
import RootStore from './root-store';

export interface IConnectedAccount {
    token: string;
    account_id: string;
    loginid: string;
    account_type: 'real' | 'demo';
    currency: string;
    balance: number;
    is_active: boolean;
    added_at: string;
}

export interface IMirroredTrade {
    contract_id: string;
    symbol: string;
    trade_type: string;
    buy_price: number;
    current_price: number;
    profit_loss: number;
    status: 'active' | 'won' | 'lost';
    timestamp: string;
    mirrored_to_count: number;
}

export default class CopyTradingStore {
    root_store: RootStore;

    // Main account (currently logged in)
    main_account: any = null;

    // Connected accounts via API tokens
    connected_accounts: IConnectedAccount[] = [];

    // Mirroring state
    is_copying: boolean = false;
    is_loading: boolean = false;
    error_message: string = '';

    // Trades
    recent_trades: IMirroredTrade[] = [];
    trades_copied_today: number = 0;
    last_mirrored_time: string = '';

    // UI state
    is_add_token_modal_open: boolean = false;
    // Internal subscription reference to avoid duplicate subscriptions
    message_subscription: { unsubscribe: () => void } | null = null;

    constructor(root_store: RootStore) {
        makeObservable(this, {
            main_account: observable,
            connected_accounts: observable,
            is_copying: observable,
            is_loading: observable,
            error_message: observable,
            recent_trades: observable,
            trades_copied_today: observable,
            last_mirrored_time: observable,
            is_add_token_modal_open: observable,
            has_connected_accounts: computed,
            active_accounts_count: computed,
            initializeMainAccount: action.bound,
            addApiToken: action.bound,
            removeAccount: action.bound,
            startMirroring: action.bound,
            stopMirroring: action.bound,
            setAddTokenModalOpen: action.bound,
            clearError: action.bound,
            loadAccountsFromStorage: action.bound,
        });

        this.root_store = root_store;
    }

    get has_connected_accounts() {
        return this.connected_accounts.length > 0;
    }

    get active_accounts_count() {
        return this.connected_accounts.filter(acc => acc.is_active).length;
    }

    initializeMainAccount() {
        // Get main account from current login
        const client = this.root_store.client;
        if (client.loginid) {
            this.main_account = {
                account_id: client.loginid,
                account_type: client.is_virtual ? 'demo' : 'real',
                currency: client.currency,
                balance: client.balance,
            };
        }
        this.loadAccountsFromStorage();
    }

    async addApiToken(token: string) {
        this.is_loading = true;
        this.error_message = '';

        try {
            // Use a separate WebSocket connection to verify the token without affecting the main session
            const verification_socket = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=65555');

            const authorize_response = await new Promise<any>((resolve, reject) => {
                verification_socket.onopen = () => {
                    verification_socket.send(JSON.stringify({ authorize: token }));
                };

                verification_socket.onmessage = msg => {
                    const data = JSON.parse(msg.data);
                    if (data.error) {
                        reject(new Error(data.error.message));
                    } else if (data.authorize) {
                        resolve(data);
                    }
                };

                verification_socket.onerror = err => reject(err);

                // Timeout
                setTimeout(() => {
                    if (verification_socket.readyState === WebSocket.OPEN) verification_socket.close();
                    reject(new Error('Timeout verifying token'));
                }, 10000);
            });

            // Close the verification socket immediately
            if (verification_socket.readyState === WebSocket.OPEN) {
                verification_socket.close();
            }

            if (authorize_response.authorize) {
                const account: IConnectedAccount = {
                    token,
                    account_id:
                        authorize_response.authorize.account_list?.[0]?.loginid || authorize_response.authorize.loginid,
                    loginid: authorize_response.authorize.loginid,
                    account_type: authorize_response.authorize.is_virtual ? 'demo' : 'real',
                    currency: authorize_response.authorize.currency,
                    balance: parseFloat(authorize_response.authorize.balance),
                    is_active: true,
                    added_at: new Date().toISOString(),
                };

                // Check if account already exists
                const exists = this.connected_accounts.some(acc => acc.account_id === account.account_id);
                if (exists) {
                    this.error_message = localize('This account is already connected');
                    return false;
                }

                this.connected_accounts.push(account);
                this.is_add_token_modal_open = false;

                // Store in localStorage
                this.saveAccountsToStorage();

                return true;
            }
        } catch (error: any) {
            this.error_message = error.message || localize('Failed to verify API token. Please try again.');
            console.error('Add API token error:', error);
            return false;
        } finally {
            this.is_loading = false;
        }

        return false;
    }

    removeAccount(account_id: string) {
        this.connected_accounts = this.connected_accounts.filter(acc => acc.account_id !== account_id);
        this.saveAccountsToStorage();
    }

    async startMirroring() {
        if (!this.has_connected_accounts) {
            this.error_message = localize('Please add at least one account to start copy trading');
            return;
        }

        this.is_copying = true;
        this.error_message = '';

        // Subscribe to transactions to detect NEW trades
        this.subscribeToTransactions();
    }

    stopMirroring() {
        this.is_copying = false;
        // Unsubscribe from message listener if present
        if (this.message_subscription) {
            try {
                this.message_subscription.unsubscribe();
            } catch (e) {
                // ignore
            }
            this.message_subscription = null;
        }
    }

    subscribeToTransactions() {
        // Subscribe to 'transaction' stream to detect balance changes (buys/sells)
        api_base.api.send({ transaction: 1, subscribe: 1 }).catch(() => {});

        // ALTERNATIVE: Use the existing 'portfolio' stream which is often more reliable for "New Contract" detection.
        api_base.api.send({ portfolio: 1, subscribe: 1 }).catch(() => {});

        // We rely on the global response handler to route 'portfolio' and 'transaction' updates to us.
        if (api_base.api) {
            try {
                // Avoid duplicate subscription
                if (this.message_subscription) return;

                const subscription = api_base.api.onMessage().subscribe(({ data }: any) => {
                    if (!data) return;
                    if (data.msg_type === 'portfolio') {
                        this.handlePortfolioUpdate();
                    }
                    if (data.msg_type === 'transaction') {
                        this.handleTransactionUpdate(data);
                    }
                });
                this.message_subscription = subscription;
                api_base.pushSubscription(subscription);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Failed to subscribe to API messages for copy trading', e);
            }
        }
    }

    handlePortfolioUpdate() {
        if (!this.is_copying) return;
        // logic to process new positions
    }

    handleTransactionUpdate(data: any) {
        if (!this.is_copying) return;

        const tx = data.transaction;
        if (tx && tx.action === 'buy') {
            // A buy happened!
            this.processBuyTransaction(tx);
        }
    }

    async processBuyTransaction(transaction: any) {
        // 1. Get transaction details to find contract_id
        const contract_id = transaction.contract_id;

        // 2. Fetch full contract details to get trade execution parameters
        try {
            const contract_data = await api_base.api.send({ proposal_open_contract: 1, contract_id });
            const contract = contract_data.proposal_open_contract;

            if (contract) {
                this.mirrorContractToConnectedAccounts(contract);
            }
        } catch (e) {
            console.error('Failed to fetch contract details for mirroring', e);
        }
    }

    async mirrorContractToConnectedAccounts(contract: any) {
        // Extract exact parameters needed to place the trade
        const trade_params = {
            contract_type: contract.contract_type,
            symbol: contract.underlying,
            basis: 'stake', // We usually copy the stake
            amount: contract.buy_price,
            currency: contract.currency,
            duration: contract.duration || undefined,
            duration_unit: contract.duration_unit || undefined,
            date_expiry: contract.date_expiry || undefined,
            barrier: contract.barrier || undefined,
            barrier2: contract.barrier2 || undefined,
            // Add other necessary props map
        };

        // If it's a digit trade, we might need prediction
        if (contract.barrier && trade_params.contract_type.includes('DIGIT')) {
            trade_params.barrier = contract.barrier; // this is often the prediction
        }

        let mirrored_count = 0;

        for (const account of this.connected_accounts) {
            if (!account.is_active) continue;

            try {
                // Construct a temporary socket for the trade execution
                const trade_socket = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=65555');

                trade_socket.onopen = () => {
                    trade_socket.send(JSON.stringify({ authorize: account.token }));
                };

                trade_socket.onmessage = msg => {
                    const data = JSON.parse(msg.data);
                    if (data.msg_type === 'authorize') {
                        // Authorized, now buy
                        trade_socket.send(
                            JSON.stringify({
                                buy: 1,
                                price: trade_params.amount,
                                parameters: {
                                    contract_type: trade_params.contract_type,
                                    symbol: trade_params.symbol,
                                    basis: 'stake',
                                    amount: trade_params.amount,
                                    currency: account.currency,
                                    duration: trade_params.duration,
                                    duration_unit: trade_params.duration_unit,
                                    barrier: trade_params.barrier,
                                },
                            })
                        );
                    } else if (data.msg_type === 'buy') {
                        if (!data.error) {
                            // Success
                            // We could count it here
                        }
                        trade_socket.close();
                    } else if (data.error) {
                        console.error('Trade Error on copy:', data.error);
                        trade_socket.close();
                    }
                };
            } catch (error) {
                console.error(`Failed to mirror to ${account.account_id}:`, error);
            }
            mirrored_count++;
        }

        // Log the trade
        const mirrored_trade: IMirroredTrade = {
            contract_id: contract.contract_id,
            symbol: contract.underlying,
            trade_type: contract.contract_type,
            buy_price: contract.buy_price,
            current_price: contract.buy_price,
            profit_loss: 0,
            status: 'active',
            timestamp: new Date().toISOString(),
            mirrored_to_count: mirrored_count,
        };

        this.recent_trades.unshift(mirrored_trade);
        this.trades_copied_today++;
    }

    setAddTokenModalOpen(isOpen: boolean) {
        this.is_add_token_modal_open = isOpen;
        if (!isOpen) {
            this.error_message = '';
        }
    }

    clearError() {
        this.error_message = '';
    }

    // Storage helpers
    private saveAccountsToStorage() {
        const accounts_data = this.connected_accounts.map(acc => ({
            ...acc,
            token: btoa(acc.token),
        }));
        localStorage.setItem('copy_trading_accounts', JSON.stringify(accounts_data));
    }

    loadAccountsFromStorage() {
        try {
            const stored = localStorage.getItem('copy_trading_accounts');
            if (stored) {
                const accounts_data = JSON.parse(stored);
                this.connected_accounts = accounts_data.map((acc: any) => ({
                    ...acc,
                    token: atob(acc.token),
                }));
            }
        } catch (error) {
            console.error('Failed to load connected accounts:', error);
        }
    }
}
