import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { TStrategy } from '@/stores/bulk-trade-store';

const BulkTraderTab = observer(() => {
    const { bulk_trade, digit_analysis } = useStore();
    const { strategies, addStrategy, removeStrategy, toggleStrategy } = bulk_trade;
    const { active_symbols } = digit_analysis;

    // Local state for new strategy form
    const [newStrategy, setNewStrategy] = React.useState<
        Omit<TStrategy, 'id' | 'status' | 'total_profit' | 'total_trades' | 'last_result_time' | 'is_active'>
    >({
        symbol: 'R_100',
        contract_type: 'DIGITMATCH',
        duration: 1,
        duration_unit: 't',
        amount: 10,
        currency: 'USD',
        parameter: 0,
    });

    const handleAdd = () => {
        addStrategy({
            ...newStrategy,
            is_active: false,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RUNNING':
                return 'var(--text-profit-success)';
            case 'BUYING':
                return 'var(--text-loss-danger)'; // Or orange?
            case 'WON':
                return 'var(--text-profit-success)';
            case 'LOST':
                return 'var(--text-loss-danger)';
            case 'ERROR':
                return 'red';
            case 'IDLE':
                return 'var(--text-general)';
            default:
                return 'var(--text-general)';
        }
    };

    return (
        <div style={{ padding: '20px', color: 'var(--text-general)', height: '100%', overflowY: 'auto' }}>
            <h2>Bulk Trader (High Frequency)</h2>
            <p>
                Run multiple strategies simultaneously. Trades are executed directly on tick reception for maximum
                speed.
                <br />
                <span style={{ color: 'var(--text-loss-danger)' }}>
                    Warning: High frequency trading can hit API rate limits.
                </span>
            </p>

            {/* Add Strategy Form */}
            <div
                style={{
                    background: 'var(--general-section-1)',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
                    alignItems: 'end',
                }}
            >
                <div>
                    <label>Symbol</label>
                    <br />
                    <select
                        value={newStrategy.symbol}
                        onChange={e => setNewStrategy({ ...newStrategy, symbol: e.target.value })}
                        style={{
                            background: 'var(--general-main-1)',
                            color: 'var(--text-general)',
                            border: '1px solid var(--border-normal)',
                            padding: '5px',
                        }}
                    >
                        {active_symbols.map(s => (
                            <option key={s.symbol} value={s.symbol}>
                                {s.display_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Type</label>
                    <br />
                    <select
                        value={newStrategy.contract_type}
                        onChange={e =>
                            setNewStrategy({
                                ...newStrategy,
                                contract_type: e.target.value as TStrategy['contract_type'],
                            })
                        }
                        style={{
                            background: 'var(--general-main-1)',
                            color: 'var(--text-general)',
                            border: '1px solid var(--border-normal)',
                            padding: '5px',
                        }}
                    >
                        <option value='DIGITMATCH'>Matches</option>
                        <option value='DIGITDIFF'>Differs</option>
                        <option value='DIGITOVER'>Over</option>
                        <option value='DIGITUNDER'>Under</option>
                        <option value='EVEN'>Even</option>
                        <option value='ODD'>Odd</option>
                    </select>
                </div>
                <div>
                    <label>Parameter (Digit/Barrier)</label>
                    <br />
                    <input
                        type='number'
                        value={newStrategy.parameter}
                        onChange={e => setNewStrategy({ ...newStrategy, parameter: Number(e.target.value) })}
                        style={{
                            background: 'var(--general-main-1)',
                            color: 'var(--text-general)',
                            border: '1px solid var(--border-normal)',
                            padding: '5px',
                            width: '60px',
                        }}
                    />
                </div>
                <div>
                    <label>Stake</label>
                    <br />
                    <input
                        type='number'
                        value={newStrategy.amount}
                        onChange={e => setNewStrategy({ ...newStrategy, amount: Number(e.target.value) })}
                        style={{
                            background: 'var(--general-main-1)',
                            color: 'var(--text-general)',
                            border: '1px solid var(--border-normal)',
                            padding: '5px',
                            width: '80px',
                        }}
                    />
                </div>
                <div>
                    <button
                        onClick={handleAdd}
                        style={{
                            background: 'var(--text-profit-success)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 15px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Add Strategy
                    </button>
                </div>
            </div>

            {/* Active Strategies List */}
            <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {strategies.map(strategy => (
                    <div
                        key={strategy.id}
                        style={{
                            background: 'var(--general-section-1)',
                            padding: '15px',
                            borderRadius: '8px',
                            border: `1px solid ${strategy.is_active ? 'var(--text-profit-success)' : 'var(--border-normal)'}`,
                            position: 'relative',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <strong style={{ fontSize: '1.2em' }}>{strategy.symbol}</strong>
                            <span
                                style={{
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    background: getStatusColor(strategy.status),
                                    color: 'white',
                                    fontSize: '0.8em',
                                }}
                            >
                                {strategy.status}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.9em', marginBottom: '10px' }}>
                            {strategy.contract_type}{' '}
                            {['DIGITMATCH', 'DIGITDIFF', 'DIGITOVER', 'DIGITUNDER'].includes(strategy.contract_type) &&
                                `(${strategy.parameter})`}
                            <br />
                            Stake: {strategy.amount} {strategy.currency}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div
                                    style={{
                                        color:
                                            strategy.total_profit >= 0
                                                ? 'var(--text-profit-success)'
                                                : 'var(--text-loss-danger)',
                                    }}
                                >
                                    P/L: {strategy.total_profit.toFixed(2)}
                                </div>
                                <div style={{ fontSize: '0.8em', opacity: 0.7 }}>Trades: {strategy.total_trades}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button
                                    onClick={() => toggleStrategy(strategy.id)}
                                    style={{
                                        background: strategy.is_active
                                            ? 'var(--text-loss-danger)'
                                            : 'var(--text-profit-success)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '5px 10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {strategy.is_active ? 'STOP' : 'START'}
                                </button>
                                <button
                                    onClick={() => removeStrategy(strategy.id)}
                                    style={{
                                        background: 'var(--general-hover)',
                                        color: 'var(--text-general)',
                                        border: 'none',
                                        padding: '5px 10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    X
                                </button>
                            </div>
                        </div>
                        {strategy.status === 'BUYING' && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'rgba(0,0,0,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                }}
                            >
                                Processing...
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {strategies.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                    No active strategies. Add one above to start trading.
                </div>
            )}
        </div>
    );
});

export default BulkTraderTab;
