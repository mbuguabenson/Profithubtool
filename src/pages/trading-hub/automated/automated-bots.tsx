import React, { ReactNode } from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';

/**
 * Reusable Card Component for the Strategy Grid
 */
const StrategyCard = observer(
    ({
        title,
        icon,
        config,
        children,
        onStart,
        isRunning,
        isWaiting,
    }: {
        title: string;
        icon?: ReactNode;
        config: any;
        children: ReactNode;
        onStart: () => void;
        isRunning: boolean;
        isWaiting?: boolean;
    }) => {
        return (
            <div
                style={{
                    background: '#1e1e1e',
                    borderRadius: '12px',
                    padding: '15px',
                    color: '#e0e0e0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    border: '1px solid #333',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid #333',
                        paddingBottom: '10px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                        {icon}
                        <span>{title}</span>
                    </div>
                    {/* Pin Icon Placeholder */}
                    <div style={{ cursor: 'pointer', opacity: 0.5 }}>📌</div>
                </div>

                {/* Market & Price Header (Visual Only for now) */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div
                        style={{
                            flex: 1,
                            background: '#111',
                            padding: '8px',
                            borderRadius: '4px',
                            fontSize: '0.8em',
                            color: '#888',
                        }}
                    >
                        Volatility 100 Index
                    </div>
                    <div
                        style={{
                            background: '#2962ff',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontSize: '0.9em',
                            fontWeight: 'bold',
                        }}
                    >
                        5543.463
                    </div>
                </div>

                {/* Dynamic Content Body */}
                <div style={{ flex: 1 }}>{children}</div>

                {/* Parameters Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7em', color: '#888', marginBottom: '4px' }}>
                            Ticks
                        </label>
                        <input
                            type='number'
                            value={config.ticks}
                            style={{
                                width: '100%',
                                background: '#333',
                                border: 'none',
                                color: 'white',
                                padding: '5px',
                                borderRadius: '4px',
                            }}
                            readOnly
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7em', color: '#888', marginBottom: '4px' }}>
                            Stake
                        </label>
                        <input
                            type='number'
                            value={config.stake}
                            style={{
                                width: '100%',
                                background: '#333',
                                border: 'none',
                                color: 'white',
                                padding: '5px',
                                borderRadius: '4px',
                            }}
                            readOnly
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7em', color: '#888', marginBottom: '4px' }}>
                            Martingale
                        </label>
                        <input
                            type='number'
                            value={config.martingale}
                            style={{
                                width: '100%',
                                background: '#333',
                                border: 'none',
                                color: 'white',
                                padding: '5px',
                                borderRadius: '4px',
                            }}
                            readOnly
                        />
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={onStart}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '6px',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        background: isRunning ? '#d32f2f' : '#2e7d32', // Red/Green
                        color: 'white',
                        marginTop: '5px',
                    }}
                >
                    {isRunning ? 'Stop Auto Trading' : 'Start Auto Trading'}
                </button>

                {isWaiting && (
                    <div
                        style={{
                            textAlign: 'center',
                            color: '#ffa000',
                            fontSize: '0.9em',
                            padding: '5px',
                            border: '1px solid #ff6f00',
                            borderRadius: '4px',
                            background: 'rgba(255, 111, 0, 0.1)',
                        }}
                    >
                        ⟳ Waiting...
                    </div>
                )}
            </div>
        );
    }
);

const AutomatedBots = observer(() => {
    const { speed_bot } = useStore();
    const { strategies, active_strategy_id } = speed_bot;

    // Helper to start/stop a strategy
    const toggleStrategy = (id: string) => {
        runInAction(() => {
            if (active_strategy_id === id) {
                speed_bot.active_strategy_id = null; // Stop
                speed_bot.is_running = false;
            } else {
                speed_bot.active_strategy_id = id; // Start
                speed_bot.is_running = true;
            }
        });
    };

    return (
        <div
            style={{
                padding: '20px',
                background: '#121212',
                minHeight: '100vh',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '20px',
            }}
        >
            {/* 1. Even/Odd (Digits) */}
            <StrategyCard
                title={strategies['even_odd_digits'].title}
                config={strategies['even_odd_digits']}
                isRunning={active_strategy_id === 'even_odd_digits'}
                onStart={() => toggleStrategy('even_odd_digits')}
                icon={<span style={{ color: '#f44336' }}>❖</span>}
            >
                {/* Visual Pattern Representation */}
                <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                    {['O', 'E', 'O', 'E', 'E', 'E', 'E'].map((l, i) => (
                        <span
                            key={i}
                            style={{
                                background: l === 'E' ? '#2e7d32' : '#d32f2f',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.8em',
                                fontWeight: 'bold',
                            }}
                        >
                            {l}
                        </span>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9em' }}>
                    <span>Check if the last</span>
                    <input
                        type='number'
                        value={5}
                        style={{
                            width: '40px',
                            background: '#333',
                            border: 'none',
                            color: 'white',
                            textAlign: 'center',
                            borderRadius: '4px',
                        }}
                    />
                    <span>digits are</span>
                    <span style={{ background: '#333', padding: '2px 8px', borderRadius: '4px' }}>Even</span>
                </div>
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9em', marginTop: '5px' }}
                >
                    <span>Then trade</span>
                    <span style={{ background: '#333', padding: '2px 8px', borderRadius: '4px' }}>Even</span>
                </div>
            </StrategyCard>

            {/* 2. Even/Odd (Percentages) */}
            <StrategyCard
                title={strategies['even_odd_percent'].title}
                config={strategies['even_odd_percent']}
                isRunning={active_strategy_id === 'even_odd_percent'}
                onStart={() => toggleStrategy('even_odd_percent')}
                isWaiting={active_strategy_id === 'even_odd_percent'}
                icon={<span style={{ color: '#f44336' }}>❖</span>}
            >
                <div
                    style={{
                        display: 'flex',
                        height: '30px',
                        margin: '10px 0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            width: '52%',
                            background: '#2e7d32',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8em',
                            fontWeight: 'bold',
                        }}
                    >
                        Even: 52.10%
                    </div>
                    <div
                        style={{
                            width: '48%',
                            background: '#d32f2f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8em',
                            fontWeight: 'bold',
                        }}
                    >
                        Odd: 47.90%
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9em' }}>
                    <span>If</span>
                    <span style={{ background: '#333', padding: '2px 8px', borderRadius: '4px' }}>Even%</span>
                    <span>≥</span>
                    <input
                        type='number'
                        value={60}
                        style={{
                            width: '40px',
                            background: '#333',
                            border: 'none',
                            color: 'white',
                            textAlign: 'center',
                            borderRadius: '4px',
                        }}
                    />
                    <span>%</span>
                </div>
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9em', marginTop: '5px' }}
                >
                    <span>Then trade</span>
                    <span style={{ background: '#333', padding: '2px 8px', borderRadius: '4px' }}>Even</span>
                </div>
            </StrategyCard>

            {/* 3. Over/Under (Digits) */}
            <StrategyCard
                title={strategies['over_under_digits'].title}
                config={strategies['over_under_digits']}
                isRunning={active_strategy_id === 'over_under_digits'}
                onStart={() => toggleStrategy('over_under_digits')}
                icon={<span style={{ color: '#ff6f00' }}>➚</span>}
            >
                {/* Digit row visual */}
                <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                    {['U', 'U', 'U', 'U', 'U', 'U', 'O'].map((l, i) => (
                        <span
                            key={i}
                            style={{
                                background: l === 'U' ? '#e65100' : '#0277bd',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.8em',
                                fontWeight: 'bold',
                            }}
                        >
                            {l}
                        </span>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
                        <div
                            key={d}
                            style={{
                                width: '25px',
                                height: '25px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: d === 5 ? '#29b6f6' : '#444',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '0.8em',
                            }}
                        >
                            {d}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8em', flexWrap: 'wrap' }}>
                    <span>Check if last</span>
                    <input
                        type='number'
                        value={3}
                        style={{
                            width: '30px',
                            background: '#333',
                            border: 'none',
                            color: 'white',
                            textAlign: 'center',
                            borderRadius: '4px',
                        }}
                    />
                    <span>digits are</span>
                    <span style={{ background: '#333', padding: '2px 5px', borderRadius: '4px' }}>Greater than</span>
                    <input
                        type='number'
                        value={5}
                        style={{
                            width: '30px',
                            background: '#333',
                            border: 'none',
                            color: 'white',
                            textAlign: 'center',
                            borderRadius: '4px',
                        }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8em', marginTop: '5px' }}>
                    <span>Then trade</span>
                    <span style={{ background: '#333', padding: '2px 5px', borderRadius: '4px' }}>Over</span>
                    <span>prediction</span>
                    <input
                        type='number'
                        value={4}
                        style={{
                            width: '30px',
                            background: '#333',
                            border: 'none',
                            color: 'white',
                            textAlign: 'center',
                            borderRadius: '4px',
                        }}
                    />
                </div>
            </StrategyCard>

            {/* 4. Over/Under (Percentages) */}
            <StrategyCard
                title={strategies['over_under_percent'].title}
                config={strategies['over_under_percent']}
                isRunning={active_strategy_id === 'over_under_percent'}
                onStart={() => toggleStrategy('over_under_percent')}
                isWaiting={active_strategy_id === 'over_under_percent'}
                icon={<span style={{ color: '#ff6f00' }}>➚</span>}
            >
                <div style={{ display: 'flex', gap: '4px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
                        <div
                            key={d}
                            style={{
                                width: '25px',
                                height: '25px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: d === 5 ? '#29b6f6' : '#444',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '0.8em',
                            }}
                        >
                            {d}
                        </div>
                    ))}
                </div>
                <div
                    style={{
                        display: 'flex',
                        height: '30px',
                        margin: '10px 0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            width: '37%',
                            background: '#0277bd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8em',
                            fontWeight: 'bold',
                        }}
                    >
                        Over 5: 36.9%
                    </div>
                    <div
                        style={{
                            width: '63%',
                            background: '#e65100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8em',
                            fontWeight: 'bold',
                        }}
                    >
                        Under 5: 63.1%
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8em', flexWrap: 'wrap' }}>
                    <span>If Digit 5</span>
                    <span style={{ background: '#333', padding: '2px 5px', borderRadius: '4px' }}>Over %</span>
                    <span>is</span>
                    <span>≥</span>
                    <span>than</span>
                    <input
                        type='number'
                        value={60}
                        style={{
                            width: '30px',
                            background: '#333',
                            border: 'none',
                            color: 'white',
                            textAlign: 'center',
                            borderRadius: '4px',
                        }}
                    />
                    <span>%</span>
                </div>
            </StrategyCard>

            {/* 5. Rise/Fall */}
            <StrategyCard
                title={strategies['rise_fall'].title}
                config={strategies['rise_fall']}
                isRunning={active_strategy_id === 'rise_fall'}
                onStart={() => toggleStrategy('rise_fall')}
                isWaiting={active_strategy_id === 'rise_fall'}
                icon={<span style={{ color: '#d32f2f' }}>➚</span>}
            >
                <div
                    style={{
                        display: 'flex',
                        height: '30px',
                        margin: '10px 0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            width: '53%',
                            background: '#2e7d32',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8em',
                            fontWeight: 'bold',
                        }}
                    >
                        Rise: 53.4%
                    </div>
                    <div
                        style={{
                            width: '47%',
                            background: '#d32f2f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8em',
                            fontWeight: 'bold',
                        }}
                    >
                        Fall: 46.6%
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9em' }}>
                    <span>If</span>
                    <span style={{ background: '#333', padding: '2px 8px', borderRadius: '4px' }}>Rise%</span>
                    <span>≥</span>
                    <input
                        type='number'
                        value={60}
                        style={{
                            width: '40px',
                            background: '#333',
                            border: 'none',
                            color: 'white',
                            textAlign: 'center',
                            borderRadius: '4px',
                        }}
                    />
                    <span>%</span>
                </div>
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9em', marginTop: '5px' }}
                >
                    <span>Then trade</span>
                    <span style={{ background: '#333', padding: '2px 8px', borderRadius: '4px' }}>Rise</span>
                </div>
            </StrategyCard>

            {/* 6. Matches/Differs */}
            <StrategyCard
                title={strategies['matches_differs'].title}
                config={strategies['matches_differs']}
                isRunning={active_strategy_id === 'matches_differs'}
                onStart={() => toggleStrategy('matches_differs')}
                isWaiting={active_strategy_id === 'matches_differs'}
                icon={<span style={{ color: '#f44336' }}>❖</span>}
            >
                <div style={{ display: 'flex', gap: '4px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
                        <div
                            key={d}
                            style={{
                                width: '25px',
                                height: '25px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: d === 5 ? '#29b6f6' : '#444',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '0.8em',
                            }}
                        >
                            {d}
                        </div>
                    ))}
                </div>
                <div
                    style={{
                        display: 'flex',
                        height: '30px',
                        margin: '10px 0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            width: '11%',
                            background: '#2e7d32',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8em',
                            fontWeight: 'bold',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Matches: 11%
                    </div>
                    <div
                        style={{
                            width: '89%',
                            background: '#d32f2f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8em',
                            fontWeight: 'bold',
                        }}
                    >
                        Differs: 88.90%
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8em', flexWrap: 'wrap' }}>
                    <span>If Digit 5</span>
                    <span style={{ background: '#333', padding: '2px 5px', borderRadius: '4px' }}>Matches %</span>
                    <span>≥</span>
                    <input
                        type='number'
                        value={60}
                        style={{
                            width: '30px',
                            background: '#333',
                            border: 'none',
                            color: 'white',
                            textAlign: 'center',
                            borderRadius: '4px',
                        }}
                    />
                    <span>%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8em', marginTop: '5px' }}>
                    <span>Then trade</span>
                    <span style={{ background: '#333', padding: '2px 5px', borderRadius: '4px' }}>Matches 5</span>
                </div>
            </StrategyCard>
        </div>
    );
});

export default AutomatedBots;
