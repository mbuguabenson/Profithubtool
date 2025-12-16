import { action, makeObservable, observable, runInAction } from 'mobx';

export default class ManualTradeStore {
    root_store: unknown;

    // Setup
    symbol: string = 'R_100';
    contract_type: string = 'DIGITMATCH';
    stake: number = 10;
    duration: number = 1;
    parameter: number = 5; // Barrier or Digit

    // State
    is_buying: boolean = false;
    last_trade_result: any = null;
    active_contract_id: number | null = null;

    constructor(root_store: any) {
        makeObservable(this, {
            symbol: observable,
            contract_type: observable,
            stake: observable,
            duration: observable,
            parameter: observable,
            is_buying: observable,
            last_trade_result: observable,
            executeTrade: action,
            setConfig: action,
        });
        this.root_store = root_store;
    }

    setConfig(config: Partial<ManualTradeStore>) {
        Object.assign(this, config);
    }

    async executeTrade() {
        if (this.is_buying) return;
        this.is_buying = true;

        try {
            // Placeholder: Call API directly
            const request = {
                buy: 1,
                price: this.stake,
                parameters: {
                    amount: this.stake,
                    basis: 'stake',
                    contract_type: this.contract_type,
                    currency: 'USD',
                    duration: this.duration,
                    duration_unit: 't',
                    symbol: this.symbol,
                    // Conditionals for digits
                    ...(this.contract_type.startsWith('DIGIT')
                        ? { barrier: this.parameter.toString(), selected_tick: this.parameter }
                        : {}),
                },
            };
            console.log('ManualTrade request', request);

            // await api_base.api.send(request);
            // handle success
        } catch (e) {
            console.error(e);
        } finally {
            runInAction(() => {
                this.is_buying = false;
            });
        }
    }
}
