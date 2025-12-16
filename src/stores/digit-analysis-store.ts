import { makeAutoObservable, runInAction } from 'mobx';
import { api_base } from '@/external/bot-skeleton/services/api/api-base';

type Tick = {
    quote: number;
    epoch: number;
    digit: number;
};

type SymbolInfo = {
    symbol: string;
    display_name: string;
    market_display_name: string;
};

type ActiveSymbol = {
    symbol: string;
    display_name: string;
    market_display_name: string;
};

type ActiveSymbolsResponse = {
    active_symbols: ActiveSymbol[];
    error?: unknown;
};

type TickResponse = {
    msg_type: 'tick';
    tick: {
        symbol: string;
        quote: number;
        epoch: number;
    };
    subscription?: {
        id: string;
    };
    error?: unknown;
};

type HistoryResponse = {
    msg_type: 'history';
    history: {
        times: number[];
        prices: number[];
    };
    echo_req: {
        ticks_history: string;
    };
    error?: unknown;
};

type SubscriptionResponse = {
    subscription?: {
        id: string;
    };
    error?: unknown;
} & (HistoryResponse | TickResponse);

interface TRootStore {
    ui: unknown;
    common: unknown;
}

export default class DigitAnalysisStore {
    root_store: TRootStore | null;

    // State
    selected_symbol: string = 'R_100';
    tick_count: number = 100;
    ticks: Tick[] = [];
    is_loading: boolean = false;
    connection_status: 'connected' | 'connecting' | 'disconnected' = 'disconnected';

    // V2 Data
    active_symbols: SymbolInfo[] = [];
    reference_digit: number = 5; // Default pivot for Over/Under

    // Subscription ID
    subscription_id: string | null = null;
    subscription_stream: { unsubscribe: () => void } | null = null;

    constructor(root_store: TRootStore | null) {
        // Ensure methods are auto-bound so destructuring in components works reliably
        makeAutoObservable(this, {}, { autoBind: true });
        this.root_store = root_store;

        // Initialize active symbols with a safe retry in case API isn't ready yet
        this.initActiveSymbols();
    }

    // Attempt to fetch active symbols immediately; if API is not yet ready, retry shortly
    initActiveSymbols = () => {
        if (api_base.api) {
            this.fetchActiveSymbols();
            return;
        }
        // Retry once API becomes available (simple short backoff)
        setTimeout(() => {
            if (api_base.api) {
                this.fetchActiveSymbols();
            } else {
                // Try one more time a bit later to avoid empty selectors
                setTimeout(() => {
                    if (api_base.api) this.fetchActiveSymbols();
                }, 1000);
            }
        }, 500);
    };

    setSymbol(symbol: string) {
        if (this.selected_symbol !== symbol) {
            this.selected_symbol = symbol;
            this.ticks = []; // Clear buffer on switch
            this.subscribe();
        }
    }

    setTickCount(count: number) {
        this.tick_count = count;
        if (this.ticks.length > count) {
            this.ticks = this.ticks.slice(this.ticks.length - count);
        }
        // If we need more history than we have, we might need to re-fetch?
        // For smooth UX, usually we just keep collecting, or re-subscribe if vital.
        // Let's re-subscribe to ensure full history if user increases count.
        if (this.ticks.length < count && this.connection_status === 'connected') {
            this.subscribe();
        }
    }

    setReferenceDigit(digit: number) {
        this.reference_digit = digit;
    }

    fetchActiveSymbols = async () => {
        // Reuse api_base active symbols if available, or fetch
        if (api_base.active_symbols && (api_base.active_symbols as ActiveSymbol[]).length > 0) {
            this.active_symbols = (api_base.active_symbols as ActiveSymbol[]).map(s => ({
                symbol: s.symbol,
                display_name: s.display_name,
                market_display_name: s.market_display_name,
            }));
            return;
        }

        // Check if api_base is initializing them?
        // We can just call the API directly if needed, but safe to try to trigger it.
        const api = api_base.api;
        if (!api) return;

        try {
            const response = (await api.send({
                active_symbols: 'brief',
                product_type: 'basic',
            })) as ActiveSymbolsResponse;
            if (response.active_symbols) {
                runInAction(() => {
                    this.active_symbols = response.active_symbols.map(s => ({
                        symbol: s.symbol,
                        display_name: s.display_name,
                        market_display_name: s.market_display_name,
                    }));
                });
            }
        } catch (e) {
            console.error('Failed to fetch active symbols', e);
        }
    };

    subscribe = async () => {
        this.is_loading = true;
        this.connection_status = 'connecting';

        await this.unsubscribe();

        const api = api_base.api;

        if (!api) {
            console.error('API not available');
            runInAction(() => {
                this.connection_status = 'disconnected';
                this.is_loading = false;
            });
            return;
        }

        try {
            const request = {
                ticks_history: this.selected_symbol,
                count: this.tick_count,
                end: 'latest',
                style: 'ticks',
                subscribe: 1,
            };

            this.subscription_stream = api
                .onMessage()
                .subscribe(({ data }: { data: TickResponse | HistoryResponse }) => {
                    if (data.msg_type === 'tick') {
                        this.onTick(data as TickResponse);
                    }
                    if (
                        data.msg_type === 'history' &&
                        (data as HistoryResponse).echo_req.ticks_history === this.selected_symbol
                    ) {
                        this.onHistory(data as HistoryResponse);
                    }
                });

            const response = (await api.send(request)) as SubscriptionResponse;

            if (response.error) {
                console.error('Subscription error', response.error);
                runInAction(() => {
                    this.connection_status = 'disconnected';
                    this.is_loading = false;
                });
                return;
            }

            if ('history' in response && response.history) {
                this.onHistory(response as HistoryResponse);
            }

            if (response.subscription) {
                runInAction(() => {
                    this.subscription_id = response.subscription!.id;
                    this.connection_status = 'connected';
                    this.is_loading = false;
                });
            }
        } catch (e) {
            console.error(e);
            runInAction(() => {
                this.connection_status = 'disconnected';
                this.is_loading = false;
            });
        }
    };

    unsubscribe = async () => {
        if (this.subscription_stream) {
            this.subscription_stream.unsubscribe();
            this.subscription_stream = null;
        }

        if (this.subscription_id) {
            const api = api_base.api;
            if (api) {
                try {
                    api.send({ forget: this.subscription_id });
                } catch (e) {
                    // ignore
                }
            }
            this.subscription_id = null;
        }

        runInAction(() => {
            this.connection_status = 'disconnected';
        });
    };

    onHistory = (response: HistoryResponse) => {
        if (response.history && response.history.times) {
            const history = response.history;
            const new_ticks = history.times.map((time, index) => {
                const quote = history.prices[index];
                return {
                    epoch: time,
                    quote: quote,
                    digit: this.getLastDigit(quote),
                };
            });

            runInAction(() => {
                this.ticks = new_ticks;
            });
        }
    };

    onTick = (tick_response: TickResponse) => {
        if (tick_response.tick && tick_response.tick.symbol === this.selected_symbol) {
            const quote = tick_response.tick.quote;
            const digit = this.getLastDigit(quote);

            const new_tick = {
                epoch: tick_response.tick.epoch,
                quote: quote,
                digit: digit,
            };

            runInAction(() => {
                this.ticks.push(new_tick);
                if (this.ticks.length > this.tick_count) {
                    this.ticks.shift();
                }
            });
        }
    };

    getLastDigit(price: number): number {
        const priceStr = price.toFixed(this.getPipSize(this.selected_symbol));
        return Number(priceStr.slice(-1));
    }

    getPipSize(symbol: string) {
        const pips = api_base.pip_sizes as Record<string, number> | undefined;
        return pips?.[symbol] || 2;
    }

    // --- Computed Statistics (V2) ---

    get digit_frequency() {
        // Calculate 0-9 percentages
        const counts = Array(10).fill(0);
        if (this.ticks.length === 0) return counts.map((_, i) => ({ digit: i, count: 0, percentage: 0 }));

        this.ticks.forEach(t => counts[t.digit]++);

        return counts.map((count, digit) => ({
            digit,
            count,
            percentage: (count / this.ticks.length) * 100,
        }));
    }

    get even_odd_stats() {
        if (this.ticks.length === 0) return { even: 0, odd: 0 };

        let even = 0;
        this.ticks.forEach(t => {
            if (t.digit % 2 === 0) even++;
        });

        const total = this.ticks.length;
        return {
            even: (even / total) * 100,
            odd: ((total - even) / total) * 100,
        };
    }

    get over_under_stats() {
        if (this.ticks.length === 0) return { over: 0, under: 0, matches: 0 };

        let over = 0;
        let under = 0;
        let matches = 0;
        const ref = this.reference_digit;

        this.ticks.forEach(t => {
            if (t.digit > ref) over++;
            else if (t.digit < ref) under++;
            else matches++;
        });

        const total = this.ticks.length;
        return {
            over: (over / total) * 100,
            under: (under / total) * 100,
            matches: (matches / total) * 100,
        };
    }

    get streak_stats() {
        if (this.ticks.length === 0) return { count: 0, type: 'none' as const };

        const ref = this.reference_digit;
        const lastTick = this.ticks[this.ticks.length - 1];

        let type: 'over' | 'under' | 'match' = 'match';
        if (lastTick.digit > ref) type = 'over';
        else if (lastTick.digit < ref) type = 'under';

        let count = 0;
        // Count backwards
        for (let i = this.ticks.length - 1; i >= 0; i--) {
            const d = this.ticks[i].digit;
            let currentType: 'over' | 'under' | 'match' = 'match';
            if (d > ref) currentType = 'over';
            else if (d < ref) currentType = 'under';

            if (currentType === type) count++;
            else break;
        }

        return { count, type };
    }

    get latest_tick() {
        return this.ticks[this.ticks.length - 1];
    }

    get current_stats() {
        return {
            price: this.latest_tick?.quote,
            digit: this.latest_tick?.digit,
        };
    }
}
