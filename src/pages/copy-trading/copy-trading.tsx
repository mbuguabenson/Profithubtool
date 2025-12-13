import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import Text from '@/components/shared_ui/text';
import { useStore } from '@/hooks/useStore';
import { localize } from '@deriv-com/translations';
import { Button } from '@deriv-com/ui';
import './copy-trading.scss';

const CopyTrading = observer(() => {
    const { copy_trading } = useStore();
    const {
        main_account,
        connected_accounts,
        is_copying,
        is_loading,
        error_message,
        recent_trades,
        addApiToken,
        startMirroring,
        stopMirroring,
        initializeMainAccount,
    } = copy_trading;

    const [activeTab, setActiveTab] = useState<'controls' | 'api'>('controls');
    const [tokenInput, setTokenInput] = useState('');

    useEffect(() => {
        initializeMainAccount();
    }, []);

    const handleAddToken = async () => {
        if (!tokenInput) return;
        await addApiToken(tokenInput);
        setTokenInput('');
    };

    return (
        <div className='copy-trading-dashboard'>
            <div className='dashboard-header'>
                <div>
                    <Text as='h1' size='xl' weight='bold' className='dashboard-title'>
                        {localize('Copy Trading Dashboard')}
                    </Text>
                    <Text as='p' size='s' className='dashboard-subtitle'>
                        {localize('Automatically copy trades from your account to others')}
                    </Text>
                </div>
                <div className='status-indicator'>
                    <span className={classNames('status-dot', { 'status-dot--connected': is_copying })}></span>
                    <Text size='xs' weight='bold' color={is_copying ? 'success' : 'less-prominent'}>
                        {is_copying ? localize('Connected') : localize('Disconnected')}
                    </Text>
                </div>
            </div>

            <div className='dashboard-tabs'>
                <button
                    className={classNames('tab-btn', { 'tab-btn--active': activeTab === 'controls' })}
                    onClick={() => setActiveTab('controls')}
                >
                    {localize('Trading Controls')}
                </button>
                <button
                    className={classNames('tab-btn', { 'tab-btn--active': activeTab === 'api' })}
                    onClick={() => setActiveTab('api')}
                >
                    {localize('API Response')}
                </button>
            </div>

            <div className='dashboard-content'>
                {activeTab === 'controls' ? (
                    <>
                        {/* Account Setup Section */}
                        <section className='dashboard-section'>
                            <div className='section-title-wrapper'>
                                <span className='section-bullet'>•</span>
                                <Text as='h2' size='m' weight='bold' className='section-title'>
                                    {localize('Account Setup')}
                                </Text>
                            </div>

                            <div className='input-group'>
                                <label className='input-label'>{localize('Your API Token')}</label>
                                <div className='input-wrapper'>
                                    <input
                                        type='text'
                                        className='deriv-input'
                                        placeholder={localize('Enter your Deriv API token')}
                                        value={tokenInput}
                                        onChange={e => setTokenInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddToken()}
                                    />
                                    <Button onClick={handleAddToken} isLoading={is_loading} className='add-btn'>
                                        {localize('Add')}
                                    </Button>
                                </div>
                                <Text size='xxs' className='input-hint'>
                                    {localize('This token authenticates the target account for copy trading')}
                                </Text>
                                {error_message && (
                                    <Text size='xs' color='error' className='error-msg'>
                                        {error_message}
                                    </Text>
                                )}
                            </div>

                            {/* Connected Accounts List (Mini) */}
                            {connected_accounts.length > 0 && (
                                <div className='connected-accounts-mini'>
                                    <Text size='xs' weight='bold' className='mb-2'>
                                        Connected Accounts:
                                    </Text>
                                    <div className='tags-container'>
                                        {connected_accounts.map(acc => (
                                            <div key={acc.account_id} className='account-tag'>
                                                <span className={`type-dot ${acc.account_type}`}></span>
                                                {acc.account_id} ({acc.currency} {acc.balance})
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Trading Actions Section */}
                        <section className='dashboard-section'>
                            <div className='section-title-wrapper'>
                                <span className='section-bullet'>•</span>
                                <Text as='h2' size='m' weight='bold' className='section-title'>
                                    {localize('Trading Actions')}
                                </Text>
                            </div>

                            <div className='actions-wrapper'>
                                <button
                                    className={classNames('action-btn action-btn--start', { disabled: is_copying })}
                                    onClick={startMirroring}
                                    disabled={is_copying}
                                >
                                    {localize('Start Copy Trading')}
                                </button>
                                <button
                                    className={classNames('action-btn action-btn--stop', { disabled: !is_copying })}
                                    onClick={stopMirroring}
                                    disabled={!is_copying}
                                >
                                    {localize('Stop Copy Trading')}
                                </button>
                            </div>
                        </section>

                        {/* Connection Status Section */}
                        <section className='dashboard-section'>
                            <div className='section-title-wrapper'>
                                <span className='section-bullet'>•</span>
                                <Text as='h2' size='m' weight='bold' className='section-title'>
                                    {localize('Connection Status')}
                                </Text>
                            </div>

                            <div className='status-cards-grid'>
                                {/* WebSocket Status */}
                                <div className='status-card'>
                                    <div className='status-card__header'>
                                        <span
                                            className={`status-dot ${main_account ? 'status-dot--connected' : 'status-dot--disconnected'}`}
                                        ></span>
                                        <span className='status-card__title'>WebSocket</span>
                                    </div>
                                    <Text size='xs' className='status-card__text'>
                                        {main_account
                                            ? localize('Connected to trading server')
                                            : localize('Disconnected from trading server')}
                                    </Text>
                                </div>

                                {/* Account Auth Status */}
                                <div className='status-card'>
                                    <div className='status-card__header'>
                                        <span
                                            className={`status-dot ${connected_accounts.length > 0 ? 'status-dot--auth' : 'status-dot--disconnected'}`}
                                        ></span>
                                        <span className='status-card__title'>Account Auth</span>
                                    </div>
                                    <Text size='xs' className='status-card__text'>
                                        {connected_accounts.length > 0
                                            ? localize(`${connected_accounts.length} Token(s) provided`)
                                            : localize('No token provided')}
                                    </Text>
                                </div>

                                {/* Trader Ready Status */}
                                <div className='status-card'>
                                    <div className='status-card__header'>
                                        <span
                                            className={`status-dot ${is_copying ? 'status-dot--ready' : 'status-dot--disconnected'}`}
                                        ></span>
                                        <span className='status-card__title'>Trader Ready</span>
                                    </div>
                                    <Text size='xs' className='status-card__text'>
                                        {is_copying
                                            ? localize('Expert trader configured')
                                            : localize('Waiting to start')}
                                    </Text>
                                </div>
                            </div>
                        </section>
                    </>
                ) : (
                    <div className='api-response-tab'>
                        <section className='dashboard-section'>
                            <div className='section-title-wrapper'>
                                <span className='section-bullet'>•</span>
                                <Text as='h2' size='m' weight='bold' className='section-title'>
                                    {localize('Live Transaction Log')}
                                </Text>
                            </div>
                            <div className='console-log'>
                                {recent_trades.length === 0 ? (
                                    <div className='console-line text-muted'>Waiting for trade activity...</div>
                                ) : (
                                    recent_trades.map((trade, i) => (
                                        <div key={i} className='console-line'>
                                            <span className='console-time'>
                                                [{new Date(trade.timestamp).toLocaleTimeString()}]
                                            </span>
                                            <span className='console-action'>BUY {trade.symbol}</span>
                                            <span className='console-detail'>
                                                Mirrored to {trade.mirrored_to_count} accounts
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
});

export default CopyTrading;
