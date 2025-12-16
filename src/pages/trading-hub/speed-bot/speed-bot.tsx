import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';

const SpeedBot = observer(() => {
    const { speed_bot, digit_analysis } = useStore();
    const { active_symbols } = digit_analysis;
    const { digit_counts } = speed_bot;

    // Helper to calculate percentages
    const total_ticks = digit_counts.reduce((a: number, b: number) => a + b, 0) || 1;
    const getPercent = (count: number) => ((count / total_ticks) * 100).toFixed(1);

    const even_count = [0, 2, 4, 6, 8].reduce((acc: number, d: number) => acc + digit_counts[d], 0);
    const odd_count = [1, 3, 5, 7, 9].reduce((acc: number, d: number) => acc + digit_counts[d], 0);
    const even_percent = ((even_count / total_ticks) * 100).toFixed(2);
    const odd_percent = ((odd_count / total_ticks) * 100).toFixed(2);

    return (
        <div
            className='speed-bot-container'
            style={{
                height: '100%',
                overflowY: 'auto',
                padding: '20px',
                background: 'var(--general-main-2)',
                color: 'var(--text-prominent)',
            }}
        >
            {/* Top Section: Analysis */}
            <div style={{ marginBottom: '30px' }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                    }}
                >
                    <select
                        value={speed_bot.symbol}
                        onChange={e => speed_bot.setSymbol(e.target.value)}
                        style={{
                            padding: '8px',
                            borderRadius: '4px',
                            background: 'white',
                            color: 'black',
                            border: '1px solid #ccc',
                            fontSize: '1.1em',
                            fontWeight: 'bold',
                        }}
                    >
                        {active_symbols.map(s => (
                            <option key={s.symbol} value={s.symbol}>
                                {s.display_name}
                            </option>
                        ))}
                    </select>
                    <div
                        style={{
                            background: 'white',
                            padding: '5px 15px',
                            borderRadius: '4px',
                            color: 'black',
                            border: '1px solid #ccc',
                        }}
                    >
                        Ticks: <strong>{total_ticks}</strong>
                    </div>
                </div>

                {/* Digit Balls (0-9) */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '15px',
                        flexWrap: 'wrap',
                        marginBottom: '30px',
                    }}
                >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
                        <div key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    background: '#2a2a2a',
                                    border: '2px solid #555',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2em',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                                    marginBottom: '5px',
                                }}
                            >
                                {d}
                            </div>
                            <span style={{ fontSize: '0.8em', color: 'var(--text-general)' }}>
                                {getPercent(digit_counts[d])}%
                            </span>
                        </div>
                    ))}
                </div>

                {/* Even/Odd Analysis Bar */}
                <div
                    style={{
                        background: 'white',
                        padding: '15px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '10px',
                            fontSize: '0.9em',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                        }}
                    >
                        <span>Even/Odd Analysis</span>
                        {/* Placeholder for streak if we track it */}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            height: '40px',
                            borderRadius: '5px',
                            overflow: 'hidden',
                            color: 'white',
                            fontWeight: 'bold',
                        }}
                    >
                        <div
                            style={{
                                width: `${even_percent}%`,
                                background: '#009688',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'width 0.3s',
                            }}
                        >
                            Even {even_percent}%
                        </div>
                        <div
                            style={{
                                width: `${odd_percent}%`,
                                background: '#e91e63',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'width 0.3s',
                            }}
                        >
                            Odd {odd_percent}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Turbo Speed AI Bot Control Panel */}
            <div
                style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    color: 'black',
                }}
            >
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2em' }}>Turbo Speed AI Bot</h3>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8em', marginBottom: '5px', fontWeight: 'bold' }}>
                            Trade Option
                        </label>
                        <select
                            value={speed_bot.contract_type}
                            onChange={e =>
                                runInAction(() =>
                                    speed_bot.updateConfig({
                                        contract_type: e.target.value as
                                            | 'EVEN'
                                            | 'ODD'
                                            | 'DIGITMATCH'
                                            | 'DIGITDIFF'
                                            | 'DIGITOVER'
                                            | 'DIGITUNDER',
                                    })
                                )
                            }
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '100px' }}
                        >
                            <option value='EVEN'>Even</option>
                            <option value='ODD'>Odd</option>
                            <option value='DIGITMATCH'>Match</option>
                            <option value='DIGITDIFF'>Differs</option>
                            <option value='DIGITOVER'>Over</option>
                            <option value='DIGITUNDER'>Under</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8em', marginBottom: '5px', fontWeight: 'bold' }}>
                            Stake
                        </label>
                        <input
                            type='number'
                            value={speed_bot.stake}
                            onChange={e => speed_bot.updateConfig({ stake: Number(e.target.value) })}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '80px' }}
                        />
                    </div>

                    <button
                        onClick={() => speed_bot.toggleBot()}
                        style={{
                            padding: '10px 25px',
                            background: speed_bot.is_running ? '#00897b' : '#0277bd', // Changed colors to match 'Start Trading' blue concept slightly, though keeping it distinct
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            marginBottom: '2px', // Alignment
                        }}
                    >
                        {speed_bot.is_running ? 'Stop Auto Trade' : 'Start Auto Trade'}
                    </button>

                    {/* Status Message */}
                    <div style={{ marginLeft: 'auto', fontSize: '0.9em' }}>
                        Total Profit:{' '}
                        <span style={{ color: speed_bot.total_profit >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                            ${speed_bot.total_profit.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Risk Management Row */}
                <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8em', marginBottom: '5px', fontWeight: 'bold' }}>
                            Take Profit ($)
                        </label>
                        <input
                            type='number'
                            value={speed_bot.tp}
                            onChange={e => speed_bot.updateConfig({ tp: Number(e.target.value) })}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '80px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8em', marginBottom: '5px', fontWeight: 'bold' }}>
                            Stop Loss ($)
                        </label>
                        <input
                            type='number'
                            value={speed_bot.sl}
                            onChange={e => speed_bot.updateConfig({ sl: Number(e.target.value) })}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '80px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ fontSize: '0.9em', fontWeight: 'bold' }}>Use Martingale:</label>
                        <input type='checkbox' checked={true} readOnly /> {/* Placeholder for now */}
                        <label style={{ marginLeft: '10px', fontSize: '0.8em', fontWeight: 'bold' }}>Multiplier:</label>
                        <input
                            type='number'
                            value={speed_bot.martingale_multiplier}
                            onChange={e => speed_bot.updateConfig({ martingale_multiplier: Number(e.target.value) })}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '60px' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default SpeedBot;
