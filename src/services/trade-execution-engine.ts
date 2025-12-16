import { makeAutoObservable, runInAction } from 'mobx';
import { api_base } from '@/external/bot-skeleton/services/api/api-base';

// Types
export interface TradeConfig {
    symbol: string;
    contract_type: string;
    stake: number;
    duration: number;
    duration_unit: 't' | 's' | 'm' | 'h' | 'd';
    currency: string;
    barrier?: string;
    prediction?: number;
}

export interface TradeResult {
    contract_id: number;
    status: 'won' | 'lost';
    profit: number;
    transaction_id: number;
}

export interface RiskConfig {
    max_loss_session: number;
    max_stake: number;
    martingale_max_steps: number;
}

class TradeExecutionEngine {
    // State
    is_trading: boolean = false;
    active_contract_id: number | null = null;
    session_profit: number = 0;
    consecutive_losses: number = 0;

    // Risk Management
    risk_config: RiskConfig = {
        max_loss_session: 100,
        max_stake: 100,
        martingale_max_steps: 10,
    };

    constructor() {
        makeAutoObservable(this);
    }

    // --- Proposal & Buy Workflow ---
    async executeTrade(config: TradeConfig): Promise<any> {
        if (this.is_trading) {
            console.warn('Trade already in progress.');
            return;
        }

        // 1. Risk Check
        if (!this.checkRisk(config.stake)) return;

        this.setTradingStatus(true);

        try {
            // 2. Get Proposal
            const proposal = await this.getProposal(config);

            if (!proposal || !proposal.id) {
                throw new Error('Invalid proposal received');
            }

            // 3. Buy
            const buy = await this.buyContract(proposal.id, proposal.ask_price);

            if (buy && buy.contract_id) {
                runInAction(() => {
                    this.active_contract_id = buy.contract_id;
                });

                // 4. Monitor Contract (Optional: usually handled by portfolio stream,
                // but for simple bots we might wait or subscribe)
                return buy;
            }
        } catch (error) {
            console.error('Trade Execution Failed:', error);
            // Handle specific Deriv API errors (e.g. InvalidMarket, InsufficientBalance)
        } finally {
            this.setTradingStatus(false);
        }
    }

    async getProposal(config: TradeConfig) {
        const req: any = {
            proposal: 1,
            amount: config.stake,
            basis: 'stake',
            contract_type: config.contract_type,
            currency: config.currency,
            duration: config.duration,
            duration_unit: config.duration_unit,
            symbol: config.symbol,
        };

        if (config.prediction !== undefined) req.barrier = config.prediction.toString(); // For Digits
        if (config.barrier) req.barrier = config.barrier; // For barrier trades

        const response = await api_base.api.send(req);
        if (response.error) {
            throw new Error(response.error.message);
        }
        return response.proposal;
    }

    async buyContract(proposal_id: string, price: number) {
        const response = await api_base.api.send({
            buy: proposal_id,
            price: price,
        });

        if (response.error) {
            throw new Error(response.error.message);
        }
        return response.buy;
    }

    // --- Risk Management ---
    checkRisk(stake: number): boolean {
        // Checks
        if (this.session_profit < -this.risk_config.max_loss_session) {
            console.error('Max Session Loss Reached. Stopping.');
            return false;
        }
        if (stake > this.risk_config.max_stake) {
            console.error('Stake Exceeds Limit.');
            return false;
        }
        return true;
    }

    updateRiskConfig(config: Partial<RiskConfig>) {
        Object.assign(this.risk_config, config);
    }

    // --- Helpers ---
    setTradingStatus(status: boolean) {
        this.is_trading = status;
    }
}

export const tradeExecutor = new TradeExecutionEngine();
export default tradeExecutor;
