import RobotIcon from '@/components/shared/icons/robot-icon';
import { BotStrategy } from '@/constants/bot-strategies';
import { localize } from '@deriv-com/translations';
import './bot-card.scss';

interface BotCardProps {
    bot: BotStrategy;
    onLoad: (bot: BotStrategy) => void;
}

export default function BotCard({ bot, onLoad }: BotCardProps) {
    return (
        <div className={`bot-row bot-row--${bot.type}`} onClick={() => onLoad(bot)}>
            <div className='bot-row__left'>
                <div className='bot-row__icon-container'>
                    <RobotIcon width={32} height={32} className='bot-row__icon-svg' />
                </div>
                <div className='bot-row__info'>
                    <h3 className='bot-row__name'>{bot.name}</h3>
                    <span className='bot-row__status'>{localize('Ready deployment')}</span>
                </div>
            </div>

            <div className='bot-row__right'>
                <button
                    className='bot-row__button'
                    onClick={e => {
                        e.stopPropagation();
                        onLoad(bot);
                    }}
                >
                    {localize('Load Bot')}
                </button>
            </div>
        </div>
    );
}
