import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';

const ManualTrading = observer(() => {
    const { manual_trade, digit_analysis } = useStore();
    const { active_symbols } = digit_analysis;

    return (
        <div
            style={{ height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
            <div style={{ maxWidth: '600px', width: '100%' }}>
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '3em', margin: 0, color: 'var(--text-prominent)' }}>
                        {digit_analysis.latest_tick?.quote ?? 'Loading...'}
                    </h2>
                    <span style={{ fontSize: '1.2em', color: 'var(--brand-secondary)' }}>
                        Last Digit: <strong>{digit_analysis.latest_tick?.digit ?? '-'}</strong>
                    </span>
                </div>

                <div
                    style={{
                        background: 'var(--general-section-1)',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                    }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Market</label>
                            <select
                                value={manual_trade.symbol}
                                onChange={e => manual_trade.setConfig({ symbol: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    background: 'var(--general-main-1)',
                                    color: 'var(--text-prominent)',
                                    border: '1px solid var(--border-normal)',
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
                            <label style={{ display: 'block', marginBottom: '5px' }}>Type</label>
                            <select
                                value={manual_trade.contract_type}
                                onChange={e => manual_trade.setConfig({ contract_type: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    background: 'var(--general-main-1)',
                                    color: 'var(--text-prominent)',
                                    border: '1px solid var(--border-normal)',
                                }}
                            >
                                <option value='DIGITMATCH'>Digit Match</option>
                                <option value='DIGITDIFF'>Digit Differs</option>
                                <option value='DIGITOVER'>Digit Over</option>
                                <option value='DIGITUNDER'>Digit Under</option>
                                <option value='EVEN'>Even</option>
                                <option value='ODD'>Odd</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Stake ($)</label>
                            <input
                                type='number'
                                value={manual_trade.stake}
                                onChange={e => manual_trade.setConfig({ stake: Number(e.target.value) })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    background: 'var(--general-main-1)',
                                    color: 'var(--text-prominent)',
                                    border: '1px solid var(--border-normal)',
                                    fontSize: '1.2em',
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Target</label>
                            <input
                                type='number'
                                value={manual_trade.parameter}
                                onChange={e => manual_trade.setConfig({ parameter: Number(e.target.value) })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    background: 'var(--general-main-1)',
                                    color: 'var(--text-prominent)',
                                    border: '1px solid var(--border-normal)',
                                    fontSize: '1.2em',
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button
                            onClick={() => manual_trade.executeTrade('buy')}
                            disabled={manual_trade.is_buying}
                            style={{
                                flex: 1,
                                padding: '20px',
                                borderRadius: '8px',
                                fontSize: '1.5em',
                                fontWeight: 'bold',
                                border: 'none',
                                cursor: 'pointer',
                                background: 'var(--status-success)',
                                color: 'white',
                                opacity: manual_trade.is_buying ? 0.7 : 1,
                                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                            }}
                        >
                            {manual_trade.is_buying ? '...' : 'BUY'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ManualTrading;
