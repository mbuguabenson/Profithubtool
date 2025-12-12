import React from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { useStore } from '@/hooks/useStore';
import { Localize } from '@deriv-com/translations';
import {
    LegacyGuide1pxIcon as LegacyPlug1pxIcon, // Placeholder
    LegacyTimeIcon as LegacyRefresh1pxIcon, // Placeholder
    LegacyEdit1pxIcon as LegacyTrash1pxIcon, // Placeholder
    StandaloneChevronDownBoldIcon as StandalonePlayFillIcon, // Placeholder
    StandaloneChevronDownBoldIcon as StandaloneStopFillIcon, // Placeholder
} from '@deriv/quill-icons';
import './copy-trading.scss';

const CopyTrading = observer(() => {
    const { copy_trading, client } = useStore();
    const {
        client_accounts,
        is_copy_trading_active,
        mirror_mode,
        addClient,
        removeClient,
        toggleCopyTrading,
        setMirrorMode,
        total_profit,
        total_loss,
        total_payout,
        active_clients_count,
        ticks_synced,
    } = copy_trading;

    const { loginid, balance, currency, is_virtual } = client;

    const [newToken, setNewToken] = React.useState('');

    const handleAddClient = () => {
        if (newToken) {
            addClient(newToken);
            setNewToken('');
        }
    };

    return (
        <div className='copy-trading'>
            {/* 1. Header Section */}
            <div className='copy-trading__header'>
                <div className='copy-trading__header__content'>
                    <div className='copy-trading__header__title'>
                        <Localize i18n_default_text='Copy Trading Engine' />
                    </div>
                    <div className='copy-trading__header__subtitle'>
                        <Localize i18n_default_text='Link client accounts and mirror trades in real-time.' />
                    </div>
                </div>
                <div className='copy-trading__header__master-info'>
                    <div className='copy-trading__header__stat-box'>
                        <span><Localize i18n_default_text='Master Account' /></span>
                        <strong>{loginid} ({is_virtual ? 'Demo' : 'Real'})</strong>
                    </div>
                    <div className='copy-trading__header__stat-box'>
                        <span><Localize i18n_default_text='Balance' /></span>
                        <strong>{currency} {balance}</strong>
                    </div>
                    <div className={classNames('copy-trading__header__status', {
                        'copy-trading__header__status--disconnected': !loginid
                    })}>
                        <LegacyPlug1pxIcon
                            iconSize='sm'
                            className={classNames('plug-icon', { 'plug-icon--connected': !!loginid })}
                            fill={loginid ? '#38ef7d' : '#ff4b2b'}
                        />
                        {loginid ? <Localize i18n_default_text='Connected' /> : <Localize i18n_default_text='Disconnected' />}
                    </div>
                </div>
            </div>

            {/* 2. Client Accounts Section */}
            <div className='copy-trading__clients'>
                <div className='copy-trading__clients__header'>
                    <h3><Localize i18n_default_text='Connected Client Accounts' /></h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type='text'
                            className='copy-input'
                            placeholder='Add Client API Token'
                            value={newToken}
                            onChange={(e) => setNewToken(e.target.value)}
                        />
                        <button className='btn-gradient btn-gradient--green' style={{ padding: '0 2rem', borderRadius: '8px' }} onClick={handleAddClient}>
                            <Localize i18n_default_text='Add' />
                        </button>
                    </div>
                </div>

                <div className='copy-trading__clients__list'>
                    {client_accounts.map((acc, idx) => (
                        <div key={idx} className={classNames('copy-trading__client-card', {
                            'copy-trading__client-card--syncing': is_copy_trading_active && acc.status === 'connected'
                        })}>
                            <div className='copy-trading__client-card__header'>
                                <span className={classNames('copy-trading__client-card__badge', {
                                    'copy-trading__client-card__badge--real': !acc.is_virtual,
                                    'copy-trading__client-card__badge--demo': acc.is_virtual
                                })}>
                                    {acc.is_virtual ? 'DEMO' : 'REAL'}
                                </span>
                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                    <LegacyRefresh1pxIcon iconSize='xs' fill='var(--text-general)' onClick={() => copy_trading.validateClient(acc)} style={{ cursor: 'pointer' }} />
                                    <LegacyTrash1pxIcon iconSize='xs' fill='#ff4b2b' onClick={() => removeClient(acc.token)} style={{ cursor: 'pointer' }} />
                                </div>
                            </div>
                            <div className='copy-trading__client-card__balance'>
                                {acc.currency} {acc.balance || '---'}
                            </div>
                            <div className='copy-trading__client-card__token'>
                                {acc.token.substring(0, 4)}...{acc.token.substring(acc.token.length - 4)}
                            </div>
                            <div style={{ marginTop: '1rem', fontSize: '1.2rem', color: acc.status === 'connected' ? '#38ef7d' : 'var(--text-disabled)' }}>
                                {acc.status.toUpperCase()}
                            </div>
                        </div>
                    ))}
                    {client_accounts.length === 0 && (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-disabled)', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                            <Localize i18n_default_text='No connected clients. Add a token to start mirroring.' />
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Controls Section */}
            <div className='copy-trading__controls'>
                <button
                    className={classNames('btn-gradient', {
                        'btn-gradient--green': !is_copy_trading_active,
                        'btn-gradient--red': is_copy_trading_active,
                    })}
                    style={{ padding: '1.2rem 3.2rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.6rem', border: 'none', cursor: 'pointer' }}
                    onClick={toggleCopyTrading}
                >
                    {is_copy_trading_active ? (
                        <>
                            <StandaloneStopFillIcon fill='white' iconSize='sm' />
                            <Localize i18n_default_text='Stop Copy Trading' />
                        </>
                    ) : (
                        <>
                            <StandalonePlayFillIcon fill='white' iconSize='sm' />
                            <Localize i18n_default_text='Start Copy Trading' />
                        </>
                    )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.4rem' }}><Localize i18n_default_text='Mirror Mode' /></span>
                    <label className='switch' style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                        <input type='checkbox' checked={mirror_mode} onChange={(e) => setMirrorMode(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span className='slider' style={{ position: 'absolute', cursor: 'pointer', inset: 0, backgroundColor: mirror_mode ? '#38ef7d' : '#ccc', borderRadius: '34px', transition: '.4s' }}></span>
                        <span style={{ position: 'absolute', content: '', height: '16px', width: '16px', left: mirror_mode ? '20px' : '4px', bottom: '4px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s' }}></span>
                    </label>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.8rem 1.6rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontSize: '1.2rem', color: 'var(--text-prominent)' }}>Speed:</span>
                    <strong style={{ color: '#00c6ff' }}>&lt; 100ms</strong>
                </div>
            </div>

            {/* 4. Statistics Section */}
            <div className='copy-trading__stats'>
                <div className='copy-trading__stats__panel copy-trading__stats__panel--profit'>
                    <span><Localize i18n_default_text='Total Profit' /></span>
                    <h3>+{total_profit.toFixed(2)}</h3>
                </div>
                <div className='copy-trading__stats__panel copy-trading__stats__panel--loss'>
                    <span><Localize i18n_default_text='Total Loss' /></span>
                    <h3>-{Math.abs(total_loss).toFixed(2)}</h3>
                </div>
                <div className='copy-trading__stats__panel'>
                    <span><Localize i18n_default_text='Active Clients' /></span>
                    <h3>{active_clients_count}</h3>
                </div>
                <div className='copy-trading__stats__panel'>
                    <span><Localize i18n_default_text='Ticks Synced' /></span>
                    <h3>{ticks_synced}</h3>
                </div>
            </div>
        </div>
    );
});

export default CopyTrading;
