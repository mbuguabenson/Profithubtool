import React from 'react';
import classNames from 'classnames';
import Text from '@/components/shared_ui/text';
import { BotStrategy } from '@/constants/bot-strategies';
import './bot-card.scss';

interface BotCardProps {
    bot: BotStrategy;
    onLoad: (bot: BotStrategy) => void;
}

const BotCard: React.FC<BotCardProps> = ({ bot, onLoad }) => {
    const isAutomatic = bot.type === 'automatic';

    return (
        <div
            className={classNames('bot-card', {
                'bot-card--automatic': isAutomatic,
                'bot-card--normal': !isAutomatic,
            })}
        >
            <div className="bot-card__header">
                <div className={classNames('bot-card__badge', `bot-card__badge--${bot.type}`)}>
                    {isAutomatic ? '🤖 Automatic' : '👤 Normal'}
                </div>
            </div>
            <div className="bot-card__content">
                <Text as="h3" weight="bold" size="s" className="bot-card__title">
                    {bot.name}
                </Text>
                <Text as="p" size="xs" className="bot-card__description">
                    {bot.description}
                </Text>
            </div>
            <div className="bot-card__footer">
                <button
                    className={classNames('bot-card__load-btn', `bot-card__load-btn--${bot.type}`)}
                    onClick={() => onLoad(bot)}
                >
                    Load Bot
                </button>
            </div>
        </div>
    );
};

export default BotCard;
