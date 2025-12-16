import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { CartesianGrid, LabelList,Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { localize } from '@deriv-com/translations';
import { useStore } from '../../hooks/useStore';
import './digits-analysis.scss';

const DigitsAnalysis = observer(() => {
    const { digit_analysis } = useStore();
    const {
        selected_symbol,
        tick_count,
        digit_frequency,
        even_odd_stats,
        over_under_stats,
        current_stats,
        streak_stats,
        connection_status,
        active_symbols,
        ticks,
        latest_tick,
        reference_digit,
        setSymbol,
        setTickCount,
        setReferenceDigit,
        subscribe,
        unsubscribe,
    } = digit_analysis;

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        subscribe();
        return () => {
            unsubscribe();
        };
    }, [subscribe, unsubscribe]);

    // Auto-scroll tick history
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [latest_tick]);

    const chartData = ticks.map((t, i) => ({
        index: i,
        digit: t.digit,
        quote: t.quote,
    }));

    return (
        <div className='digits-analysis'>
            <div className='digits-analysis__container'>
                {/* --- Header --- */}
                <div className='digits-analysis__header'>
                    <div className='header-left'>
                        <div className='symbol-selector-wrapper'>
                            <select
                                className='symbol-select'
                                value={selected_symbol}
                                onChange={e => setSymbol(e.target.value)}
                            >
                                {active_symbols.length > 0 ? (
                                    active_symbols.map(s => (
                                        <option key={s.symbol} value={s.symbol}>
                                            {s.display_name}
                                        </option>
                                    ))
                                ) : (
                                    <option value={selected_symbol}>{selected_symbol}</option>
                                )}
                            </select>
                            <span className={classNames('status-dot', connection_status)}></span>
                        </div>
                    </div>

                    <div className='header-stats'>
                        <div className='stat-box'>
                            <span className='label'>PRICE</span>
                            <span className='value price-value pulse-effect'>
                                {current_stats.price !== undefined ? current_stats.price : '---'}
                            </span>
                        </div>
                        <div className='stat-box highlight-box'>
                            <span className='label'>LAST DIGIT</span>
                            <span className={classNames('value big-digit', `digit-${current_stats.digit}`)}>
                                {current_stats.digit !== undefined ? current_stats.digit : '-'}
                            </span>
                        </div>
                        <div className='tick-counter'>
                            <select
                                value={tick_count}
                                onChange={e => setTickCount(Number(e.target.value))}
                                className='tick-select'
                            >
                                {[25, 50, 100, 200, 500, 1000].map(c => (
                                    <option key={c} value={c}>
                                        {c} Ticks
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- Main Grid --- */}
                <div className='digits-analysis__grid'>
                    {/* --- Column 1: Charts & Graphs --- */}
                    <div className='grid-col main-charts'>
                        {/* Trend Chart */}
                        <div className='da-card chart-card'>
                            <div className='card-header'>
                                <h3>{localize('Last Digits Trend')}</h3>
                            </div>
                            <div className='chart-container'>
                                <ResponsiveContainer width='100%' height={180}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray='3 3' stroke='#ffffff10' />
                                        <YAxis
                                            domain={[0, 9]}
                                            tickCount={10}
                                            stroke='#ffffff50'
                                            fontSize={10}
                                            width={20}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1d26', border: '1px solid #ffffff20' }}
                                            itemStyle={{ color: '#39ff14' }}
                                            labelStyle={{ display: 'none' }}
                                        />
                                        <Line
                                            type='monotone'
                                            dataKey='digit'
                                            stroke='#00a8ff'
                                            strokeWidth={2}
                                            dot={{ r: 2, fill: '#00a8ff' }}
                                            activeDot={{ r: 5, fill: '#39ff14' }}
                                            isAnimationActive={false}
                                        >
                                            <LabelList dataKey='digit' position='top' className='chart-point-label' />
                                        </Line>
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Frequency Rings */}
                        <div className='da-card frequency-card'>
                            <div className='card-header'>
                                <h3>{localize('Digit Frequency')}</h3>
                            </div>
                            <div className='frequency-grid'>
                                {digit_frequency.map(item => (
                                    <div key={item.digit} className='digit-ring'>
                                        <div className='ring-top-label'>
                                            {item.count}/{tick_count}
                                        </div>
                                        <div className='ring-wrapper'>
                                            <svg viewBox='0 0 36 36' className='circular-chart'>
                                                <path
                                                    className='circle-bg'
                                                    d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                                                />
                                                <path
                                                    className='circle'
                                                    strokeDasharray={`${item.percentage}, 100`}
                                                    d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                                                    style={{ stroke: `var(--digit-color-${item.digit}, #00a8ff)` }}
                                                />
                                            </svg>
                                            <div className='ring-content'>
                                                <span className='digit-label'>{item.digit}</span>
                                            </div>
                                        </div>
                                        <div className='ring-stats'>
                                            <span className='count'>{item.count}</span>
                                            <span className='percent'>{item.percentage.toFixed(1)}%</span>
                                        </div>
                                        <div
                                            className='heat-bar'
                                            style={{
                                                height: '3px',
                                                width: '100%',
                                                background: `rgba(255,255,255,0.1)`,
                                                marginTop: '4px',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${item.percentage}%`,
                                                    background:
                                                        item.percentage > 15
                                                            ? '#ff4757'
                                                            : item.percentage > 10
                                                              ? '#ffa502'
                                                              : '#2ed573',
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- Column 2: Analysis & Stats --- */}
                    <div className='grid-col analysis-stats'>
                        {/* Even / Odd */}
                        <div className='da-card stats-card even-odd'>
                            <div className='card-header'>
                                <h3>{localize('Even / Odd')}</h3>
                            </div>
                            <div className='stats-content'>
                                <div className='dual-stat-row'>
                                    <div className='stat-unit even'>
                                        <span className='stat-label'>EVEN</span>
                                        <span className='stat-val'>{even_odd_stats.even.toFixed(1)}%</span>
                                    </div>
                                    <div className='stat-unit odd'>
                                        <span className='stat-label'>ODD</span>
                                        <span className='stat-val'>{even_odd_stats.odd.toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div className='multi-progress-bar'>
                                    <div
                                        className='bar-segment even'
                                        style={{ width: `${even_odd_stats.even}%` }}
                                    ></div>
                                    <div className='bar-segment odd' style={{ width: `${even_odd_stats.odd}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Over / Under */}
                        <div className='da-card stats-card over-under'>
                            <div
                                className='card-header with-controls'
                                style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <h3>{localize('Over / Under')}</h3>
                                    {streak_stats.count > 0 && (
                                        <div className={`streak-badge ${streak_stats.type}`}>
                                            Streak: {streak_stats.count}x {streak_stats.type.toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Pill Selector */}
                                <div className='digit-pill-selector'>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
                                        <button
                                            key={d}
                                            className={classNames('pill-btn', { active: reference_digit === d })}
                                            onClick={() => setReferenceDigit(d)}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className='stats-content'>
                                <div className='tri-stat-row'>
                                    <div className='stat-unit over'>
                                        <span className='stat-label'>OVER {reference_digit}</span>
                                        <span className='stat-val'>{over_under_stats.over.toFixed(1)}%</span>
                                    </div>
                                    <div className='stat-unit match'>
                                        <span className='stat-label'>MATCH</span>
                                        <span className='stat-val'>{over_under_stats.matches.toFixed(1)}%</span>
                                    </div>
                                    <div className='stat-unit under'>
                                        <span className='stat-label'>UNDER {reference_digit}</span>
                                        <span className='stat-val'>{over_under_stats.under.toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div className='multi-progress-bar'>
                                    <div
                                        className='bar-segment over'
                                        style={{ width: `${over_under_stats.over}%` }}
                                    ></div>
                                    <div
                                        className='bar-segment match'
                                        style={{ width: `${over_under_stats.matches}%` }}
                                    ></div>
                                    <div
                                        className='bar-segment under'
                                        style={{ width: `${over_under_stats.under}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Column 3: Tick History (Grid) --- */}
                    <div className='grid-col tick-history'>
                        <div className='da-card history-card'>
                            <div className='card-header'>
                                <h3>{localize('History')}</h3>
                            </div>
                            <div className='history-grid-scroller' ref={scrollRef}>
                                {/* Grid Visualization - Even/Odd */}
                                <div className='history-grid'>
                                    {[...ticks].reverse().map((tick, index) => {
                                        const type = tick.digit % 2 === 0 ? 'even' : 'odd';
                                        const isLatest = index === 0;

                                        return (
                                            <div
                                                key={tick.epoch}
                                                className={classNames('history-tile', type, { latest: isLatest })}
                                            >
                                                <span className='digit'>{tick.digit}</span>
                                                <span className='type-indicator'>{type === 'even' ? 'E' : 'O'}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default DigitsAnalysis;
