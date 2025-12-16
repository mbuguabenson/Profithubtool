import { makeAutoObservable, runInAction } from 'mobx';
import { api_base } from '@/external/bot-skeleton/services/api/api-base';

// Types
export interface ActiveSymbol {
    symbol: string;
    display_name: string;
    market: string;
    market_display_name: string;
    submarket: string;
    submarket_display_name: string;
    // Categorization helpers
    is_forex?: boolean;
    is_derived?: boolean;
}

export interface Tick {
    symbol: string;
    quote: number;
    epoch: number;
    digit?: number;
}

// Trade proposal params used for requesting quotes and executing trades
export interface TradeProposal {
    contract_type: string;
    symbol: string;
    duration: number;
    duration_unit: 't' | 's' | 'm' | 'h' | 'd';
    basis: 'stake' | 'payout';
    amount: number;
    currency: string;
    barrier?: string;
}

class MarketDataEngine {
    // State
    active_symbols: ActiveSymbol[] = [];
    tick_history: Map<string, Tick[]> = new Map();
    latest_ticks: Map<string, Tick> = new Map();
    subscriptions: Map<string, string> = new Map(); // symbol -> subscriptionId

    // Options
    tick_buffer_size: 25 | 50 | 100 = 100; // Configurable

    constructor() {
        makeAutoObservable(this);
        // Do not init immediately to avoid race conditions with Auth
    }

    async initialize() {
        await this.fetchActiveSymbols();
        // Attach a single message listener to route tick updates into the engine buffers
        api_base.api
            .onMessage()
            .subscribe(
                ({ data }: { data: { msg_type: string; tick?: { symbol: string; quote: number; epoch: number } } }) => {
                    if (data?.msg_type === 'tick') {
                        this.handleTick({ tick: data.tick });
                    }
                }
            );
    }

    // --- Active Symbols ---
    async fetchActiveSymbols() {
        try {
            const response = await api_base.api.send({ active_symbols: 'brief', product_type: 'basic' });
            if (response.active_symbols) {
                runInAction(() => {
                    this.active_symbols = response.active_symbols.map((s: ActiveSymbol) => ({
                        ...s,
                        is_forex: s.market === 'forex',
                        is_derived: s.market === 'synthetic_index' || s.market === 'volidx', // Check Deriv explicit market codes
                    }));
                });
            }
        } catch (error) {
            console.error('Failed to fetch active symbols:', error);
        }
    }

    // --- Tick Management ---
    setBufferSize(size: 25 | 50 | 100) {
        this.tick_buffer_size = size;
        // Resize existing buffers
        this.tick_history.forEach((ticks, symbol) => {
            if (ticks.length > size) {
                this.tick_history.set(symbol, ticks.slice(-size));
            }
        });
    }

    async subscribeToTick(symbol: string) {
        if (this.subscriptions.has(symbol)) return; // Already subscribed

        try {
            const response = await api_base.api.send({ ticks: symbol, subscribe: 1 });
            if (response.tick) {
                if (response.subscription) {
                    runInAction(() => {
                        this.subscriptions.set(symbol, response.subscription.id);
                    });
                }
            }
        } catch (error) {
            console.error(`Failed to subscribe to ${symbol}:`, error);
        }
    }

    unsubscribeFromTick(symbol: string) {
        const subId = this.subscriptions.get(symbol);
        if (subId) {
            api_base.api.send({ forget: subId });
            runInAction(() => {
                this.subscriptions.delete(symbol);
            });
        }
    }

    handleTick(tickData: Record<string, any>) {
        // This method should be called when a 'tick' event is received
        if (tickData.tick) {
            const { symbol, quote, epoch } = tickData.tick;

            // Calculate digit
            const quoteStr = quote.toFixed(this.getPipSize(symbol));
            const digit = parseInt(quoteStr.slice(-1));

            const tick: Tick = { symbol, quote, epoch, digit };

            runInAction(() => {
                // Update Latest
                this.latest_ticks.set(symbol, tick);

                // Update History
                let history = this.tick_history.get(symbol) || [];
                history.push(tick);

                // Rolling Buffer Logic
                if (history.length > this.tick_buffer_size) {
                    history = history.slice(-this.tick_buffer_size);
                }
                this.tick_history.set(symbol, history);
            });
        }
    }

    getPipSize(symbol: string): number {
        const active_symbol = this.active_symbols.find(s => s.symbol === symbol);
        if (active_symbol) {
            // Placeholder logic: if pip is needed, we usually get it from active_symbols pip property
            // For now returning 3 as in original code
            return 3;
        }
        return 3;
    }

    // --- Trade Execution ---
    async getProposal(params: TradeProposal) {
        return await api_base.api.send({
            proposal: 1,
            ...params,
        });
    }

    async executeTrade(proposal_id: string, price: number) {
        return await api_base.api.send({
            buy: proposal_id,
            price: price,
        });
    }
}

export const marketDataEngine = new MarketDataEngine();
export default marketDataEngine;
