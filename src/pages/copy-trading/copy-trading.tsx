import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { ITrader, IActiveCopySession, IMirroredTrade } from '@/stores/copy-trading-store';
import { localize } from '@deriv-com/translations';
import './copy-trading.scss';

const CopyTrading = observer(() => {
    const { copy_trading } = useStore();
    const {
        available_traders,
        active_sessions,
        mirrored_trades,
        is_loading,
        error_message,
        has_active_sessions,
        fetchTraders,
        startCopying,
        stopCopying,
        setSelectedTrader,
        clearError,
    } = copy_trading;

    useEffect(() => {
        fetchTraders();
    }, []);

    const handleStartCopying = (trader_id: string) => {
        startCopying(trader_id);
    };

    const handleStopCopying = (trader_id: string) => {
        stopCopying(trader_id);
    };

    const isTraderBeingCopied = (trader_id: string) => {
        return active_sessions.some(session => session.trader_id === trader_id);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(2)}%`;
    };

    const getRiskColor = (risk_level: string) => {
        switch (risk_level) {
            case 'low':
                return 'var(--status-success)';
            case 'medium':
                return 'var(--status-warning)';
            case 'high':
                return 'var(--status-danger)';
            default:
                return 'var(--text-general)';
        }
    };

    return (
        <div className='copy-trading'>
            <div className='copy-trading__header'>
                <h1 className='copy-trading__title'>{localize('Copy Trading')}</h1>
                <p className='copy-trading__subtitle'>
                    {localize('Mirror trades from successful traders automatically')}
                </p>
            </div>

            {error_message && (
                <div className='copy-trading__error'>
                    <span>{error_message}</span>
                    <button onClick={clearError} className='copy-trading__error-close'>
                        ×
                    </button>
                </div>
            )}

            {has_active_sessions && (
                <div className='copy-trading__active-section'>
                    <h2 className='copy-trading__section-title'>{localize('Active Copy Sessions')}</h2>
                    <div className='copy-trading__sessions'>
                        {active_sessions.map((session: IActiveCopySession) => (
                            <div key={session.trader_id} className='copy-trading__session-card glass-effect'>
                                <div className='copy-trading__session-header'>
                                    <div className='copy-trading__session-info'>
                                        <h3>{session.trader_name}</h3>
                                        <span className='copy-trading__session-status'>
                                            <span className='copy-trading__status-dot'></span>
                                            {localize('Active')}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleStopCopying(session.trader_id)}
                                        className='copy-trading__button copy-trading__button--stop'
                                        disabled={is_loading}
                                    >
                                        {localize('Stop Copying')}
                                    </button>
                                </div>
                                <div className='copy-trading__session-stats'>
                                    <div className='copy-trading__stat'>
                                        <span className='copy-trading__stat-label'>{localize('Copied Trades')}</span>
                                        <span className='copy-trading__stat-value'>{session.copied_trades}</span>
                                    </div>
                                    <div className='copy-trading__stat'>
                                        <span className='copy-trading__stat-label'>{localize('P/L')}</span>
                                        <span
                                            className={`copy-trading__stat-value ${session.profit_loss >= 0 ? 'positive' : 'negative'
                                                }`}
                                        >
                                            {formatCurrency(session.profit_loss)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {mirrored_trades.length > 0 && (
                        <div className='copy-trading__mirrored-trades'>
                            <h3 className='copy-trading__subsection-title'>{localize('Mirrored Trades')}</h3>
                            <div className='copy-trading__trades-list'>
                                {mirrored_trades.map((trade: IMirroredTrade) => (
                                    <div key={trade.contract_id} className='copy-trading__trade-item glass-effect'>
                                        <div className='copy-trading__trade-header'>
                                            <span className='copy-trading__trade-symbol'>{trade.symbol}</span>
                                            <span className={`copy-trading__trade-status status-${trade.status}`}>
                                                {trade.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className='copy-trading__trade-details'>
                                            <div>
                                                <span className='copy-trading__detail-label'>{localize('Type')}</span>
                                                <span>{trade.trade_type}</span>
                                            </div>
                                            <div>
                                                <span className='copy-trading__detail-label'>{localize('Buy Price')}</span>
                                                <span>{formatCurrency(trade.buy_price)}</span>
                                            </div>
                                            <div>
                                                <span className='copy-trading__detail-label'>{localize('Current')}</span>
                                                <span>{formatCurrency(trade.current_price)}</span>
                                            </div>
                                            <div>
                                                <span className='copy-trading__detail-label'>{localize('P/L')}</span>
                                                <span
                                                    className={trade.profit_loss >= 0 ? 'positive' : 'negative'}
                                                >
                                                    {formatCurrency(trade.profit_loss)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className='copy-trading__traders-section'>
                <h2 className='copy-trading__section-title'>{localize('Available Traders')}</h2>
                {is_loading && available_traders.length === 0 ? (
                    <div className='copy-trading__loading'>
                        <div className='copy-trading__spinner'></div>
                        <p>{localize('Loading traders...')}</p>
                    </div>
                ) : available_traders.length === 0 ? (
                    <div className='copy-trading__empty'>
                        <p>{localize('No traders available at the moment')}</p>
                    </div>
                ) : (
                    <div className='copy-trading__traders-grid'>
                        {available_traders.map((trader: ITrader) => (
                            <div key={trader.account_id} className='copy-trading__trader-card glass-effect'>
                                <div className='copy-trading__trader-header'>
                                    <div className='copy-trading__trader-avatar'>
                                        {trader.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className='copy-trading__trader-info'>
                                        <h3>{trader.name}</h3>
                                        <span className='copy-trading__trader-followers'>
                                            {trader.followers_count} {localize('followers')}
                                        </span>
                                    </div>
                                </div>

                                <div className='copy-trading__trader-stats'>
                                    <div className='copy-trading__stat-row'>
                                        <span className='copy-trading__stat-label'>{localize('Total Profit')}</span>
                                        <span
                                            className={`copy-trading__stat-value ${trader.total_profit >= 0 ? 'positive' : 'negative'
                                                }`}
                                        >
                                            {formatCurrency(trader.total_profit)}
                                        </span>
                                    </div>
                                    <div className='copy-trading__stat-row'>
                                        <span className='copy-trading__stat-label'>{localize('Win Rate')}</span>
                                        <span className='copy-trading__stat-value'>
                                            {formatPercentage(trader.win_rate)}
                                        </span>
                                    </div>
                                    <div className='copy-trading__stat-row'>
                                        <span className='copy-trading__stat-label'>{localize('Total Trades')}</span>
                                        <span className='copy-trading__stat-value'>{trader.total_trades}</span>
                                    </div>
                                    <div className='copy-trading__stat-row'>
                                        <span className='copy-trading__stat-label'>{localize('Risk Level')}</span>
                                        <span
                                            className='copy-trading__stat-value'
                                            style={{ color: getRiskColor(trader.risk_level) }}
                                        >
                                            {trader.risk_level.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() =>
                                        isTraderBeingCopied(trader.account_id)
                                            ? handleStopCopying(trader.account_id)
                                            : handleStartCopying(trader.account_id)
                                    }
                                    className={`copy-trading__button ${isTraderBeingCopied(trader.account_id)
                                            ? 'copy-trading__button--stop'
                                            : 'copy-trading__button--start'
                                        }`}
                                    disabled={is_loading}
                                >
                                    {isTraderBeingCopied(trader.account_id)
                                        ? localize('Stop Copying')
                                        : localize('Start Copying')}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

export default CopyTrading;
