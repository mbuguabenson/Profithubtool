import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { localize } from '@deriv-com/translations';
import './risk-management.scss';

type TTradingPlanItem = {
    day: number;
    session: number;
    startBalance: number;
    riskAmount: number;
    targetProfit: number;
    stopLoss: number;
    endBalance: number;
};

const RiskManagement = observer(() => {
    const [capital, setCapital] = useState<number>(1000);
    const [riskPercentage, setRiskPercentage] = useState<number>(5);
    const [customRisk, setCustomRisk] = useState<number>(5);
    const [days, setDays] = useState<number>(20);
    const [sessions, setSessions] = useState<number>(1);
    const [riskReward, setRiskReward] = useState<number>(2); // Default 1:2
    const [isCompounding, setIsCompounding] = useState<boolean>(false);
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
    const [tradingPlan, setTradingPlan] = useState<TTradingPlanItem[]>([]);

    const [targetProfit, setTargetProfit] = useState<number>(0);

    // Derived values for summary
    const dailyRiskAmount = capital * (riskPercentage / 100);
    const sessionRiskAmount = dailyRiskAmount / sessions;
    const sessionTargetProfit = sessionRiskAmount * riskReward;

    // Recommended Stake = Session Risk Amount (assuming Stop Loss is 100% of stake)
    const recommendedStake = sessionRiskAmount;

    useEffect(() => {
        // Keep Target Profit input synced with calculated values when other inputs change (one-way sync)

        // So Daily TP is just Daily Risk * R:R
        setTargetProfit(Number((dailyRiskAmount * riskReward).toFixed(2)));
    }, [riskPercentage, riskReward, dailyRiskAmount]);

    const handleTargetProfitChange = (val: number) => {
        setTargetProfit(val);
        // Reverse calculate Risk % needed
        // Daily Risk Needed = val / riskReward
        // Risk % = (Daily Risk Needed / capital) * 100

        if (capital > 0 && riskReward > 0) {
            const neededDailyRisk = val / riskReward;
            const neededRiskPercent = (neededDailyRisk / capital) * 100;

            // Update Risk % (and Custom Risk Input)
            setRiskPercentage(Number(neededRiskPercent.toFixed(2)));
            setCustomRisk(Number(neededRiskPercent.toFixed(2)));
        }
    };

    const handleRiskPreset = (percent: number) => {
        setRiskPercentage(percent);
        setCustomRisk(percent);
    };

    const handleCustomRiskChange = (val: number) => {
        setCustomRisk(val);
        setRiskPercentage(val);
    };

    const calculatePlan = () => {
        const plan: TTradingPlanItem[] = [];
        let currentBalance = capital;

        for (let day = 1; day <= days; day++) {
            // If compounding, calculate risk on potentially new balance (if we assume daily growth)
            // However, for standard risk plan, usually we want to see the projected path.
            // If compounding is OFF, risk is based on INITIAL CAPITAL.
            // If compounding is ON, risk is based on CURRENT BALANCE.

            const dailyRisk = isCompounding
                ? currentBalance * (riskPercentage / 100)
                : capital * (riskPercentage / 100);

            const sessionRisk = dailyRisk / sessions;
            const sessionTP = sessionRisk * riskReward;

            // We simulate hitting the target for the sake of the plan
            let dailyProfit = 0;

            for (let session = 1; session <= sessions; session++) {
                plan.push({
                    day,
                    session,
                    startBalance: currentBalance + dailyProfit, // Intra-day balance update? Or End Of Day? Let's show running balance.
                    riskAmount: sessionRisk,
                    stopLoss: sessionRisk,
                    targetProfit: sessionTP,
                    endBalance: currentBalance + dailyProfit + sessionTP,
                });
                dailyProfit += sessionTP;
            }
            currentBalance += dailyProfit;
        }
        setTradingPlan(plan);
    };

    // Auto-calculate on initial load or changes if desired?
    // User requested "Instant recalculation" - let's calculate on effect
    useEffect(() => {
        calculatePlan();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [capital, riskPercentage, days, sessions, riskReward, isCompounding]);

    return (
        <div className='risk-management'>
            <div className='risk-management__container'>
                <div className='risk-management__header'>
                    <h1>{localize('Risk Management Configuration')}</h1>
                    <p>{localize('Design your professional trading plan with precision controls.')}</p>
                </div>

                <div className='risk-management__grid'>
                    {/* --- Configuration Column --- */}
                    <div className='risk-management__column'>
                        <div className='risk-management__card'>
                            <div className='risk-management__input-group'>
                                <label>{localize('Initial Capital')}</label>
                                <div className='input-wrapper'>
                                    <input
                                        type='number'
                                        value={capital}
                                        onChange={e => setCapital(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className='risk-management__input-group'>
                                <label>{localize('Risk Percentage')}</label>
                                <div className='risk-management__btn-group'>
                                    {[2, 5, 10].map(percent => (
                                        <button
                                            key={percent}
                                            className={classNames({
                                                active: riskPercentage === percent,
                                                'active-risk-10': percent === 10 && riskPercentage === 10,
                                            })}
                                            onClick={() => handleRiskPreset(percent)}
                                        >
                                            {percent}%
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className='risk-management__input-group'>
                                <label>{localize('Sessions per Day')}</label>
                                <div className='risk-management__btn-group'>
                                    {[1, 2, 3].map(s => (
                                        <button
                                            key={s}
                                            className={classNames({ active: sessions === s })}
                                            onClick={() => setSessions(s)}
                                        >
                                            {s} Session{s > 1 ? 's' : ''}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className='risk-management__input-group'>
                                <label>{localize('Daily Target Profit ($)')}</label>
                                <div className='input-wrapper'>
                                    <input
                                        type='number'
                                        value={targetProfit}
                                        onChange={e => handleTargetProfitChange(Number(e.target.value))}
                                        placeholder='Enter target profit...'
                                    />
                                </div>
                            </div>

                            <button
                                className='risk-management__advanced-toggle'
                                onClick={() => setShowAdvanced(!showAdvanced)}
                            >
                                {showAdvanced ? localize('Hide Advanced Settings') : localize('Show Advanced Settings')}
                            </button>

                            {showAdvanced && (
                                <div className='risk-management__advanced-section'>
                                    <div className='risk-management__input-group'>
                                        <label>{localize('Trading Days')}</label>
                                        <div className='input-wrapper no-currency'>
                                            <input
                                                type='number'
                                                value={days}
                                                onChange={e => setDays(Number(e.target.value))}
                                                placeholder='e.g. 20'
                                            />
                                        </div>
                                    </div>
                                    <div className='risk-management__input-group'>
                                        <label>{localize('Custom Risk %')}</label>
                                        <div className='input-wrapper'>
                                            <input
                                                type='number'
                                                value={customRisk}
                                                onChange={e => handleCustomRiskChange(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div className='risk-management__input-group'>
                                        <label>{localize('Risk : Reward Ratio (1:X)')}</label>
                                        <div className='input-wrapper'>
                                            <input
                                                type='number'
                                                value={riskReward}
                                                onChange={e => setRiskReward(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div
                                        className='risk-management__input-group'
                                        style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem' }}
                                    >
                                        <input
                                            type='checkbox'
                                            checked={isCompounding}
                                            onChange={e => setIsCompounding(e.target.checked)}
                                            style={{ width: 'auto' }}
                                        />
                                        <label style={{ marginBottom: 0 }}>{localize('Enable Compounding')}</label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='risk-management__actions'>
                            <button
                                className='secondary'
                                onClick={() => {
                                    setCapital(1000);
                                    setRiskPercentage(5);
                                    setSessions(1);
                                    setDays(20);
                                }}
                            >
                                {localize('Reset')}
                            </button>
                            <button className='primary' onClick={() => window.print()}>
                                {localize('Export Plan')}
                            </button>
                        </div>
                    </div>

                    {/* --- Summary & Content Column --- */}
                    <div className='risk-management__column'>
                        {/* Live Summary Cards */}
                        <div className='risk-management__summary-grid'>
                            <div className='risk-management__summary-card'>
                                <span className='label'>{localize('Daily Risk Limit')}</span>
                                <span className='value loss'>${dailyRiskAmount.toFixed(2)}</span>
                                <span className='sub-value'>{riskPercentage}% of Capital</span>
                            </div>
                            <div className='risk-management__summary-card'>
                                <span className='label'>{localize('Recommended Stake')}</span>
                                <span className='value' style={{ color: 'var(--rm-accent-orange)' }}>
                                    ${recommendedStake.toFixed(2)}
                                </span>
                                <span className='sub-value'>{localize('Per Session')}</span>
                            </div>
                            <div className='risk-management__summary-card'>
                                <span className='label'>{localize('Target Profit')}</span>
                                <span className='value profit'>${sessionTargetProfit.toFixed(2)}</span>
                                <span className='sub-value'>Based on 1:{riskReward} R:R</span>
                            </div>
                            <div className='risk-management__summary-card'>
                                <span className='label'>{localize('Projected Growth')}</span>
                                <span className='value' style={{ color: 'var(--rm-accent-blue)' }}>
                                    {tradingPlan.length > 0
                                        ? `$${(tradingPlan[tradingPlan.length - 1].endBalance - capital).toFixed(2)}`
                                        : '$0.00'}
                                </span>
                                <span className='sub-value'>Total Profit</span>
                            </div>
                        </div>

                        {/* Trading Plan Table */}
                        <div className='risk-management__card risk-management__card--no-padding'>
                            <div className='risk-management__table-container'>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>{localize('Day')}</th>
                                            <th>{localize('Session')}</th>
                                            <th>{localize('Risk Amount')}</th>
                                            <th>{localize('Stop Loss')}</th>
                                            <th>{localize('Take Profit')}</th>
                                            <th>{localize('End Balance')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tradingPlan.map(row => (
                                            <tr key={`${row.day}-${row.session}`}>
                                                <td>{row.day}</td>
                                                <td>{row.session}</td>
                                                <td style={{ color: 'var(--rm-text-secondary)' }}>
                                                    ${row.riskAmount.toFixed(2)}
                                                </td>
                                                <td className='loss'>-${row.stopLoss.toFixed(2)}</td>
                                                <td className='profit'>+${row.targetProfit.toFixed(2)}</td>
                                                <td style={{ fontWeight: 700 }}>${row.endBalance.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default RiskManagement;
