import { action, computed, makeObservable, observable, reaction } from 'mobx';
import { api_base } from '@/external/bot-skeleton';
import { localize } from '@deriv-com/translations';
import RootStore from './root-store';

export interface ITrader {
    account_id: string;
    loginid: string;
    name: string;
    total_profit: number;
    total_trades: number;
    win_rate: number;
    avg_duration: number;
    risk_level: 'low' | 'medium' | 'high';
    active_since: string;
    followers_count: number;
}

export interface IActiveCopySession {
    trader_id: string;
    trader_name: string;
    start_time: string;
    copied_trades: number;
    profit_loss: number;
}

export interface IMirroredTrade {
    contract_id: string;
    symbol: string;
    trade_type: string;
    buy_price: number;
    current_price: number;
    profit_loss: number;
    status: 'active' | 'won' | 'lost';
}

export default class CopyTradingStore {
    root_store: RootStore;

    available_traders: ITrader[] = [];
    active_sessions: IActiveCopySession[] = [];
    mirrored_trades: IMirroredTrade[] = [];
    is_loading: boolean = false;
    error_message: string = '';
    selected_trader_id: string | null = null;

    constructor(root_store: RootStore) {
        makeObservable(this, {
            available_traders: observable,
            active_sessions: observable,
            mirrored_trades: observable,
            is_loading: observable,
            error_message: observable,
            selected_trader_id: observable,
            has_active_sessions: computed,
            fetchTraders: action.bound,
            startCopying: action.bound,
            stopCopying: action.bound,
            setSelectedTrader: action.bound,
            clearError: action.bound,
        });

        this.root_store = root_store;
    }

    get has_active_sessions() {
        return this.active_sessions.length > 0;
    }

    async fetchTraders() {
        this.is_loading = true;
        this.error_message = '';

        try {
            const response = await api_base.api.send({ copytrading_list: 1 });

            if (response.error) {
                this.error_message = response.error.message || localize('Failed to fetch traders');
                this.available_traders = [];
            } else if (response.copytrading_list) {
                // Transform API response to our trader format
                this.available_traders = (response.copytrading_list.copiers || []).map((trader: any) => ({
                    account_id: trader.loginid || '',
                    loginid: trader.loginid || '',
                    name: trader.loginid || 'Unknown Trader',
                    total_profit: 0,
                    total_trades: 0,
                    win_rate: 0,
                    avg_duration: 0,
                    risk_level: 'medium' as const,
                    active_since: new Date().toISOString(),
                    followers_count: 0,
                }));

                // Fetch statistics for each trader
                await this.fetchTraderStatistics();
            }
        } catch (error) {
            this.error_message = localize('Network error. Please try again.');
            console.error('Copy trading fetch error:', error);
        } finally {
            this.is_loading = false;
        }
    }

    async fetchTraderStatistics() {
        // Fetch statistics for all traders
        for (const trader of this.available_traders) {
            try {
                const stats_response = await api_base.api.send({
                    copytrading_statistics: 1,
                    trader_id: trader.account_id,
                });

                if (stats_response.copytrading_statistics) {
                    const stats = stats_response.copytrading_statistics;
                    trader.total_profit = stats.total_profit_loss || 0;
                    trader.total_trades = stats.total_trades || 0;
                    trader.win_rate = stats.total_trades
                        ? ((stats.winning_trades || 0) / stats.total_trades) * 100
                        : 0;
                }
            } catch (error) {
                console.error(`Failed to fetch stats for trader ${trader.account_id}:`, error);
            }
        }
    }

    async startCopying(trader_id: string) {
        this.is_loading = true;
        this.error_message = '';

        try {
            const trader = this.available_traders.find(t => t.account_id === trader_id);
            if (!trader) {
                this.error_message = localize('Trader not found');
                return;
            }

            const response = await api_base.api.send({
                copy_start: trader_id,
            });

            if (response.error) {
                this.error_message = response.error.message || localize('Failed to start copying');
            } else {
                // Add to active sessions
                const new_session: IActiveCopySession = {
                    trader_id: trader.account_id,
                    trader_name: trader.name,
                    start_time: new Date().toISOString(),
                    copied_trades: 0,
                    profit_loss: 0,
                };
                this.active_sessions.push(new_session);

                // Subscribe to trader's trades for mirroring
                this.subscribeMirroredTrades(trader_id);
            }
        } catch (error) {
            this.error_message = localize('Network error. Please try again.');
            console.error('Start copying error:', error);
        } finally {
            this.is_loading = false;
        }
    }

    async stopCopying(trader_id: string) {
        this.is_loading = true;
        this.error_message = '';

        try {
            const response = await api_base.api.send({
                copy_stop: trader_id,
            });

            if (response.error) {
                this.error_message = response.error.message || localize('Failed to stop copying');
            } else {
                // Remove from active sessions
                this.active_sessions = this.active_sessions.filter(
                    session => session.trader_id !== trader_id
                );

                // Remove mirrored trades for this trader
                this.mirrored_trades = this.mirrored_trades.filter(
                    trade => !trade.contract_id.startsWith(trader_id)
                );
            }
        } catch (error) {
            this.error_message = localize('Network error. Please try again.');
            console.error('Stop copying error:', error);
        } finally {
            this.is_loading = false;
        }
    }

    subscribeMirroredTrades(trader_id: string) {
        // Subscribe to portfolio to monitor mirrored trades
        api_base.api.send({ portfolio: 1, subscribe: 1 }).then((response) => {
            if (response.portfolio) {
                // Filter trades that are being mirrored from this trader
                const trades = (response.portfolio.contracts || []).map((contract: any) => ({
                    contract_id: contract.contract_id,
                    symbol: contract.symbol,
                    trade_type: contract.contract_type,
                    buy_price: contract.buy_price,
                    current_price: contract.bid_price || contract.buy_price,
                    profit_loss: contract.profit || 0,
                    status: contract.is_sold ? (contract.profit > 0 ? 'won' : 'lost') : 'active',
                }));

                this.mirrored_trades = trades;
            }
        });
    }

    setSelectedTrader(trader_id: string | null) {
        this.selected_trader_id = trader_id;
    }

    clearError() {
        this.error_message = '';
    }
}
