import { observer } from 'mobx-react-lite';
import BotCard from '@/components/bot-card/bot-card';
import RobotIcon from '@/components/shared/icons/robot-icon';
import { DBOT_TABS } from '@/constants/bot-contents';
import { BotStrategy, getAutomaticBots, getHybridBots, getNormalBots } from '@/constants/bot-strategies';
import { useStore } from '@/hooks/useStore';
import { localize } from '@deriv-com/translations';
import './bots.scss';
const Bots = observer(() => {
    const { load_modal, dashboard } = useStore();
    const { loadStrategyToBuilder } = load_modal;
    const { setActiveTab } = dashboard;

    const handleLoadBot = async (bot: BotStrategy) => {
        try {
            // Fetch the XML file
            const response = await fetch(`/${encodeURI(bot.xmlPath)}`);
            if (!response.ok) {
                console.error(`Failed to load bot XML: ${bot.xmlPath}`);
                return;
            }

            const xmlContent = await response.text();

            // Load the XML into the workspace using loadStrategyToBuilder
            await loadStrategyToBuilder({
                id: bot.id,
                name: bot.name,
                xml: xmlContent,
                save_type: 'unsaved',
                timestamp: Date.now(),
            });

            // Close the load modal if it's open (to prevent "double screen" issues)
            load_modal.toggleLoadModal(false);

            // Switch to Bot Builder tab to show the loaded bot
            setActiveTab(DBOT_TABS.BOT_BUILDER);
        } catch (error) {
            console.error('Error loading bot:', error);
        }
    };

    const normalBots = getNormalBots();
    const automaticBots = getAutomaticBots();
    const hybridBots = getHybridBots();

    return (
        <div className='bots-page'>
            <div className='bots-page__header'>
                <div className='bots-page__title-section'>
                    <RobotIcon className='bots-page__title-icon' width={40} height={40} />
                    <div>
                        <h1 className='bots-page__title'>{localize('Bot Library')}</h1>
                        <p className='bots-page__subtitle'>
                            {localize('Choose from our collection of proven trading strategies')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Automatic Bots Section */}
            <section className='bots-page__section'>
                <div className='bots-page__section-header bots-page__section-header--automatic'>
                    <div className='bots-page__section-title-wrapper'>
                        <h2 className='bots-page__section-title'>{localize('Automatic Bots')}</h2>
                        <span className='bots-page__section-count'>{automaticBots.length}</span>
                    </div>
                    <p className='bots-page__section-description'>
                        {localize('Fully automated strategies with built-in risk management and decision-making')}
                    </p>
                </div>
                <div className='bots-page__grid'>
                    {automaticBots.map(bot => (
                        <BotCard key={bot.id} bot={bot} onLoad={handleLoadBot} />
                    ))}
                </div>
            </section>

            {/* Hybrid Bots Section */}
            <section className='bots-page__section'>
                <div className='bots-page__section-header bots-page__section-header--hybrid'>
                    <div className='bots-page__section-title-wrapper'>
                        <h2 className='bots-page__section-title'>{localize('Hybrid Bots')}</h2>
                        <span className='bots-page__section-count'>{hybridBots.length}</span>
                    </div>
                    <p className='bots-page__section-description'>
                        {localize('Semi-automated strategies leveraging green signals for optimal entry points')}
                    </p>
                </div>
                <div className='bots-page__grid'>
                    {hybridBots.map(bot => (
                        <BotCard key={bot.id} bot={bot} onLoad={handleLoadBot} />
                    ))}
                </div>
            </section>

            {/* Normal Bots Section */}
            <section className='bots-page__section'>
                <div className='bots-page__section-header bots-page__section-header--normal'>
                    <div className='bots-page__section-title-wrapper'>
                        <h2 className='bots-page__section-title'>{localize('Normal Bots')}</h2>
                        <span className='bots-page__section-count'>{normalBots.length}</span>
                    </div>
                    <p className='bots-page__section-description'>
                        {localize('Professional-grade bots with customizable parameters requiring manual oversight')}
                    </p>
                </div>
                <div className='bots-page__grid'>
                    {normalBots.map(bot => (
                        <BotCard key={bot.id} bot={bot} onLoad={handleLoadBot} />
                    ))}
                </div>
            </section>
        </div>
    );
});

export default Bots;
