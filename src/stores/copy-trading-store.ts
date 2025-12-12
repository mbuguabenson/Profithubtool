import { action, computed, makeObservable, observable, reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { api_base } from '@/external/bot-skeleton';
import { getCurrencyDisplayCode } from '@/external/bot-skeleton/utils';
import RootStore from './root-store';

export type TClientAccount = {
    token: string;
    loginid?: string;
    balance?: string;
    currency?: string;
    is_virtual?: boolean;
    status: 'connected' | 'disconnected' | 'syncing';
    socket?: WebSocket; // Or DerivAPI instance
};

export default class CopyTradingStore {
    root_store: RootStore;

    @observable is_copy_trading_active = false;
    @observable mirror_mode = false;
    @observable client_accounts: TClientAccount[] = [];
    @observable active_tokens: string = '';

    // Stats
    @observable total_profit = 0;
    @observable total_loss = 0;
    @observable total_payout = 0;
    @observable active_clients_count = 0;
    @observable ticks_synced = 0;

    constructor(root_store: RootStore) {
        this.root_store = root_store;
        makeObservable(this);

        // Load from localStorage if needed
        this.loadSettings();
    }

    @action.bound
    addClient(token: string) {
        if (this.client_accounts.find(c => c.token === token)) return;

        // TODO: Validate token via WS
        const new_client: TClientAccount = {
            token,
            status: 'syncing',
            is_virtual: false, // Placeholder until validation
        };
        this.client_accounts.push(new_client);
        this.validateClient(new_client);
        this.saveSettings();
    }

    @action.bound
    removeClient(token: string) {
        this.client_accounts = this.client_accounts.filter(c => c.token !== token);
        this.saveSettings();
    }

    @action.bound
    async validateClient(client: TClientAccount) {
        // Mock validation for now
        // In real impl, open WS with token, authorize, get balance
        setTimeout(() => {
            client.status = 'connected';
            client.loginid = 'CR' + Math.floor(Math.random() * 1000000);
            client.currency = 'USD';
            client.balance = '1000.00';
            client.is_virtual = false;
            this.client_accounts = [...this.client_accounts]; // Trigger update
        }, 1000);
    }

    @action.bound
    toggleCopyTrading() {
        this.is_copy_trading_active = !this.is_copy_trading_active;
    }

    @action.bound
    setMirrorMode(value: boolean) {
        this.mirror_mode = value;
    }

    @action.bound
    loadSettings() {
        // Load saved tokens
    }

    @action.bound
    saveSettings() {
        // Save tokens
    }

    // Logic to listen to master transactions
    @action.bound
    onMasterTransaction(transaction: any) {
        if (!this.is_copy_trading_active) return;
        if (transaction.action === 'buy') {
            // Trigger copy
            this.ticks_synced++;
        }
    }
}
