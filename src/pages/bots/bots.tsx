import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import Text from '@/components/shared_ui/text';
import { BOT_STRATEGIES, BotStrategy } from '@/constants/bot-strategies';
import { useStore } from '@/hooks/useStore';
import { DBOT_TABS } from '@/constants/bot-contents';
import { useDevice } from '@deriv-com/ui';
import { RobotIcon } from '@/components/shared/icons/robot-icon';
import './bots.scss';

const Bots = observer(() => {
    const { load_modal, dashboard } = useStore();
    const { loadFileFromRecent } = load_modal;
    const { setActiveTab } = dashboard;
    const { isDesktop } = useDevice();

    const handleLoadBot = async (bot: BotStrategy) => {
        try {
            // Fetch the XML file
            const response = await fetch(`/${bot.xmlPath}`);
            if (!response.ok) {
                console.error(`Failed to load bot XML: ${bot.xmlPath}`);
                return;
            }

            const xmlContent = await response.text();

            // Load the XML into the workspace using the load_modal utility
            loadFileFromRecent({
                xml_doc: xmlContent,
                file_name: bot.name,
            });

            // Switch to Bot Builder tab to show the loaded bot
            setActiveTab(DBOT_TABS.BOT_BUILDER);
        } catch (error) {
            console.error('Error loading bot:', error);
        }
    };

    return (
        <div className="bots-page">
            <div className="bots-page__header">
                <Text as="h1" weight="bold" size="l" className="bots-page__title">
                    Bot Library
                </Text>
                <Text as="p" size="s" className="bots-page__subtitle">
                    Choose from our collection of proven trading strategies
                </Text>
            </div>

            <div className="bots-page__list">
                {BOT_STRATEGIES.map(bot => (
                    <div
                        key={bot.id}
                        className={`bot-list-item bot-list-item--${bot.type}`}
                        onClick={() => handleLoadBot(bot)}
                    >
                        <div className="bot-list-item__icon">
                            <RobotIcon />
                        </div>
                        <div className="bot-list-item__content">
                            <Text as="h3" weight="bold" size="s" className="bot-list-item__name">
                                {bot.name}
                            </Text>
                            <Text as="p" size="xs" className="bot-list-item__status">
                                {bot.description} • Click to load
                            </Text>
                        </div>
                        <button className={`bot-list-item__button bot-list-item__button--${bot.type}`}>
                            Load Bot
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default Bots;
