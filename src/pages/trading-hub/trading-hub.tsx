import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import marketDataEngine from '@/services/market-data-engine';
import BulkTraderTab from '../bulk-trader/bulk-trader-tab';
import AutomatedBots from './automated/automated-bots';
import ManualTrading from './manual/manual-trading';
import SpeedBot from './speed-bot/speed-bot';

const TradingHub = observer(() => {
    const { trading_hub } = useStore();
    const { active_tab, setActiveTab } = trading_hub;

    React.useEffect(() => {
        marketDataEngine.initialize();
    }, []);

    const handleTabClick = (id: 'speed' | 'manual' | 'bulk' | 'automated') => {
        console.log('Switching to tab:', id);
        setActiveTab(id);
    };

    const tabs = [
        { id: 'speed', label: 'Speed Bot' },
        { id: 'automated', label: 'Automatic Bots' },
        { id: 'manual', label: 'Manual Trading' },
        { id: 'bulk', label: 'Bulk Trading' },
    ];

    return (
        <div
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--general-main-1)',
                color: 'var(--text-general)',
            }}
        >
            {/* Header Tabs */}
            <div
                style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--border-normal)',
                    background: 'var(--general-section-1)',
                }}
            >
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id as 'speed' | 'manual' | 'bulk' | 'automated')}
                        style={{
                            flex: 1,
                            padding: '15px',
                            background: active_tab === tab.id ? 'var(--general-main-1)' : 'transparent',
                            color: active_tab === tab.id ? 'var(--text-prominent)' : 'var(--text-general)',
                            border: 'none',
                            borderBottom: active_tab === tab.id ? '2px solid var(--brand-secondary)' : 'none',
                            cursor: 'pointer',
                            fontSize: '1em',
                            fontWeight: active_tab === tab.id ? 'bold' : 'normal',
                            transition: 'all 0.2s',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflow: 'hidden', padding: '0px' }}>
                {active_tab === 'speed' && <SpeedBot />}
                {active_tab === 'automated' && <AutomatedBots />}
                {active_tab === 'manual' && <ManualTrading />}
                {active_tab === 'bulk' && <BulkTraderTab />}
            </div>
        </div>
    );
});

export default TradingHub;
