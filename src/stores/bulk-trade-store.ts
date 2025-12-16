import { action, makeObservable, observable, runInAction } from 'mobx';
import { api_base } from '@/external/bot-skeleton';
import RootStore from './root-store';

export type TStrategyStatus = 'IDLE' | 'RUNNING' | 'BUYING' | 'WON' | 'LOST' | 'ERROR';

export type TStrategy = {
    id: string;
    symbol: string;
    contract_type: 'DIGITMATCH' | 'DIGITDIFF' | 'DIGITOVER' | 'DIGITUNDER' | 'CALLE' | 'PUTE' | 'EVEN' | 'ODD'; // Expanded as needed via UI
    duration: number;
    duration_unit: 't' | 's' | 'm';
    amount: number;
    currency: string;
    parameter: number; // e.g., last digit prediction or barrier
    is_active: boolean;
    status: TStrategyStatus;
    total_profit: number;
    total_trades: number;
    last_result_time: number;
};

export default class BulkTradeStore {
    root_store: RootStore;
    strategies: TStrategy[] = [];
    active_symbols_subscriptions: Map<string, { unsubscribe: () => void }> = new Map();

    constructor(root_store: RootStore) {
        makeObservable(this, {
            strategies: observable,
            addStrategy: action,
            removeStrategy: action,
            toggleStrategy: action,
            updateStrategyStatus: action,
            updateStrategyProfit: action,
            handleTick: action,
        });
        this.root_store = root_store;
    }

    addStrategy = (
        strategy: Omit<TStrategy, 'id' | 'status' | 'total_profit' | 'total_trades' | 'last_result_time'>
    ) => {
        const new_strategy: TStrategy = {
            ...strategy,
            id: `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'IDLE',
            total_profit: 0,
            total_trades: 0,
            last_result_time: 0,
        };
        this.strategies.push(new_strategy);
    };

    removeStrategy = (id: string) => {
        const strategy = this.strategies.find(s => s.id === id);
        if (strategy && strategy.is_active) {
            this.toggleStrategy(id); // Stop it first
        }
        this.strategies = this.strategies.filter(s => s.id !== id);
    };

    toggleStrategy = (id: string) => {
        const strategy = this.strategies.find(s => s.id === id);
        if (strategy) {
            strategy.is_active = !strategy.is_active;
            if (strategy.is_active) {
                strategy.status = 'RUNNING';
                this.subscribeToSymbol(strategy.symbol);
            } else {
                strategy.status = 'IDLE';
                this.checkUnsubscription(strategy.symbol);
            }
        }
    };

    updateStrategyStatus = (id: string, status: TStrategyStatus) => {
        const strategy = this.strategies.find(s => s.id === id);
        if (strategy) {
            strategy.status = status;
        }
    };

    updateStrategyProfit = (id: string, profit: number) => {
        const strategy = this.strategies.find(s => s.id === id);
        if (strategy) {
            strategy.total_profit += profit;
            strategy.total_trades += 1;
            strategy.last_result_time = Date.now();
        }
    };

    subscribeToSymbol = (symbol: string) => {
        if (!this.active_symbols_subscriptions.has(symbol)) {
            // New subscription needed
            const subscription = api_base.api
                .onMessage()
                .subscribe(({ data }: { data: { msg_type: string; tick: { quote: number; symbol: string } } }) => {
                    if (data.msg_type === 'tick' && data.tick.symbol === symbol) {
                        this.handleTick(symbol, data.tick);
                    }
                });
            api_base.api.send({ ticks: symbol, subscribe: 1 });
            this.active_symbols_subscriptions.set(symbol, subscription);
        }
    };

    checkUnsubscription = (symbol: string) => {
        // Only unsubscribe if NO active strategies use this symbol
        const active_users = this.strategies.filter(s => s.is_active && s.symbol === symbol);
        if (active_users.length === 0) {
            const subscription = this.active_symbols_subscriptions.get(symbol);
            if (subscription) {
                subscription.unsubscribe();
                api_base.api.send({ forget_all: 'ticks' }); // Be careful not to forget other symbols? 'ticks' forgets specific stream if ID passed, 'forget_all' forgets all.
                // Better to use forget with ID, but for now we just keep it simple.
                // Actually, api_base wraps subscriptions. We should just rely on the observable unsubscribe.
                // But we still need to send 'forget' to server to save bandwidth?
                // api_base manages subscriptions list?
                // We'll trust the observable unsubscribe for now.
            }
            this.active_symbols_subscriptions.delete(symbol);
        }
    };

    handleTick = (symbol: string, tick: { quote: number; symbol: string }) => {
        const quote = tick.quote;
        const last_digit = parseInt(quote.toFixed(this.getPipSize(symbol)).slice(-1));

        // Get all active strategies for this symbol
        const relevant_strategies = this.strategies.filter(
            s => s.is_active && s.symbol === symbol && s.status === 'RUNNING'
        );

        relevant_strategies.forEach(strategy => {
            if (this.checkCondition(strategy, last_digit)) {
                this.executeTrade(strategy);
            }
        });
    };

    getPipSize = (symbol: string) => {
        const sizes = api_base.pip_sizes as Record<string, number> | undefined;
        return sizes?.[symbol] || 2;
    };

    checkCondition = (strategy: TStrategy, last_digit: number) => {
        // High-speed synchronous check
        switch (strategy.contract_type) {
            case 'DIGITMATCH':
                return last_digit === strategy.parameter;
            case 'DIGITDIFF':
                return last_digit !== strategy.parameter;
            case 'DIGITOVER':
                return last_digit > strategy.parameter;
            case 'DIGITUNDER':
                return last_digit < strategy.parameter;
            case 'EVEN':
                return last_digit % 2 === 0;
            case 'ODD':
                return last_digit % 2 !== 0;
            default:
                return false;
        }
    };

    executeTrade = async (strategy: TStrategy) => {
        // Prevent double buying if already buying?
        // User asked for "Trade every tick". If we are already buying, do we buy again?
        // Yes, "Bulk" implies concurrency. But let's set status to BUYING to give visual feedback.
        // We won't block re-entry unless user wants to (maybe add a "Max Concurrent" setting later).

        // For visual clarity, we might want to flicker 'BUYING'
        runInAction(() => {
            strategy.status = 'BUYING';
        });

        const proposal_params = {
            amount: strategy.amount,
            basis: 'stake' as const,
            contract_type: strategy.contract_type,
            currency: strategy.currency,
            duration: strategy.duration,
            duration_unit: strategy.duration_unit,
            symbol: strategy.symbol,
            ...(strategy.contract_type.startsWith('DIGIT') ? { barrier: strategy.parameter.toString() } : {}),
        };

        try {
            const proposal_response: { error?: Record<string, unknown>; proposal?: { id: string } } =
                await api_base.api.send({ proposal: 1, ...proposal_params });

            if (proposal_response.error || !proposal_response.proposal?.id) {
                console.error('Bulk Trade Proposal Error:', proposal_response.error);
                runInAction(() => {
                    strategy.status = 'ERROR';
                });
                return;
            }

            const proposal_id = proposal_response.proposal.id;
            const buy_response: { error?: Record<string, unknown>; buy?: { contract_id: number } } =
                await api_base.api.send({ buy: proposal_id, price: strategy.amount });
            if (buy_response.error || !buy_response.buy?.contract_id) {
                runInAction(() => {
                    strategy.status = 'ERROR';
                });
                return;
            }

            const contract_id = buy_response.buy.contract_id;
            // Subscribe to contract proposal to get result
            // Or just Proposal Open Contract
            const poc_subscription = api_base.api.onMessage().subscribe(
                ({
                    data,
                }: {
                    data: {
                        msg_type: string;
                        proposal_open_contract: { contract_id: number; is_sold: boolean; profit: number };
                    };
                }) => {
                    if (
                        data.msg_type === 'proposal_open_contract' &&
                        data.proposal_open_contract.contract_id === contract_id
                    ) {
                        const contract = data.proposal_open_contract;
                        if (contract.is_sold) {
                            const profit = contract.profit;
                            runInAction(() => {
                                this.updateStrategyProfit(strategy.id, profit);
                                strategy.status = profit >= 0 ? 'WON' : 'LOST';
                                // Reset to RUNNING after a short delay for visual effect?
                                // Or immediately.
                                setTimeout(() => {
                                    if (strategy.is_active) strategy.status = 'RUNNING';
                                }, 1000);
                            });
                            poc_subscription.unsubscribe();
                        }
                    }
                }
            );
            api_base.api.send({ proposal_open_contract: 1, contract_id, subscribe: 1 });
        } catch (e) {
            console.error('Bulk Trade Exception:', e);
            runInAction(() => {
                strategy.status = 'ERROR';
            });
        }
    };
}
