import { action, makeObservable, observable, reaction } from 'mobx';
import marketDataEngine from '@/services/market-data-engine';
import tradeExecutor from '@/services/trade-execution-engine';

export default class SpeedBotStore {
    root_store: unknown;

    // ... (rest of config) ...
    // Configuration
    symbol: string = 'R_100';
    contract_type: 'DIGITMATCH' | 'DIGITDIFF' | 'DIGITOVER' | 'DIGITUNDER' | 'EVEN' | 'ODD' = 'DIGITMATCH';
    stake: number = 10;
    duration: number = 1;
    martingale_multiplier: number = 2;
    martingale_max_steps: number = 5;
    tp: number = 50;
    sl: number = 50;

    // Live Data
    digit_counts: number[] = Array(10).fill(0);

    // Automation Strategy
    active_strategy_id: string | null = null;
    strategies: any = {
        even_odd_digits: {
            title: 'Even/Odd (Digits)',
            ticks: 5,
            stake: 10,
            martingale: 1,
        },
        even_odd_percent: {
            title: 'Even/Odd (%)',
            ticks: 5,
            stake: 10,
            martingale: 1,
        },
        over_under_digits: {
            title: 'Over/Under (Digits)',
            ticks: 3,
            stake: 10,
            martingale: 1,
        },
        over_under_percent: {
            title: 'Over/Under (%)',
            ticks: 3,
            stake: 10,
            martingale: 1,
        },
        rise_fall: {
            title: 'Rise/Fall',
            ticks: 5,
            stake: 10,
            martingale: 1,
        },
        matches_differs: {
            title: 'Matches/Differs',
            ticks: 5,
            stake: 10,
            martingale: 1,
        },
    };

    // Status
    is_running: boolean = false;
    status: 'IDLE' | 'SCANNING' | 'EXECUTING' | 'COOLDOWN' = 'IDLE';
    total_profit: number = 0;
    win_count: number = 0;
    loss_count: number = 0;

    constructor(root_store: any) {
        makeObservable(this, {
            symbol: observable,
            contract_type: observable,
            stake: observable,
            duration: observable,
            is_running: observable,
            status: observable,
            setSymbol: action,
            toggleBot: action,
            updateConfig: action,
            handleTick: action,
        });
        this.root_store = root_store;

        // Reactive Tick Loop
        reaction(
            () => marketDataEngine.latest_ticks.get(this.symbol),
            tick => {
                if (tick) {
                    this.handleTick();
                }
            }
        );
    }

    setSymbol(symbol: string) {
        this.symbol = symbol;
        marketDataEngine.subscribeToTick(symbol);
    }

    updateConfig(config: Partial<SpeedBotStore>) {
        Object.assign(this, config);
    }

    toggleBot() {
        this.is_running = !this.is_running;
        this.status = this.is_running ? 'SCANNING' : 'IDLE';
        // Ensure we are subscribed
        if (this.is_running) {
            marketDataEngine.subscribeToTick(this.symbol);
        }
    }

    async handleTick() {
        if (!this.is_running) return;

        // 1. Get Data from Engine
        const history = marketDataEngine.tick_history.get(this.symbol) || [];
        if (history.length < 5) return; // Need min buffer

        // 2. Strategy Logic (Example: Even/Odd %)
        // This is where the "Probability Engine" lives
        // In a real implementation, we would switch(active_strategy_id)

        // Simple Even/Odd Logic for Speed Bot Demo
        if (this.contract_type === 'EVEN') {
            const lastDigit = history[history.length - 1].digit;
            if (lastDigit !== undefined && lastDigit % 2 === 0) {
                // Trigger Trade?
                // Usually Speed Bots wait for X evens in a row or % threshold
                // Implementation of specific strategy logic goes here.
                // For now, let's just log it to prove connection.
                // console.log("Even detected", lastDigit);
                // Example Execution
                // await this.executeTrade('EVEN');
            }
        }
    }

    async executeTrade(type: string) {
        this.status = 'EXECUTING';
        try {
            const result = await tradeExecutor.executeTrade({
                symbol: this.symbol,
                contract_type: type,
                stake: this.stake,
                duration: this.duration,
                duration_unit: 't',
                currency: 'USD',
            });

            if (result) {
                // Handle Win/Loss update (Mocked or Real)
                // In real app, we subscribe to 'proposal_open_contract'
                console.log('Trade Placed:', result);
            }
        } catch (e) {
            console.error(e);
        } finally {
            this.status = 'SCANNING';
        }
    }
}
