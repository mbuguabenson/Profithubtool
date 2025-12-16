import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import { formatMoney, getCurrencyDisplayCode } from '@/components/shared';
import Text from '@/components/shared_ui/text';
import { LogTypes } from '@/external/bot-skeleton';
import { useStore } from '@/hooks/useStore';
import { Localize, localize } from '@deriv-com/translations';
import { TFormatMessageProps } from '../journal.types';

const FormatMessage = observer(({ logType, className, extra }: TFormatMessageProps) => {
    const { client } = useStore();
    const { is_kes_enabled, kes_rate } = client;

    const getLogMessage = () => {
        switch (logType) {
            case LogTypes.LOAD_BLOCK: {
                return localize('Blocks are loaded successfully');
            }
            case LogTypes.NOT_OFFERED: {
                return localize('Resale of this contract is not offered.');
            }
            case LogTypes.PURCHASE: {
                const { longcode, transaction_id } = extra;
                return (
                    <Localize
                        i18n_default_text='<0>Bought</0>: {{longcode}} (ID: {{transaction_id}})'
                        values={{ longcode, transaction_id }}
                        components={[<Text key={0} size='xxs' styles={{ color: 'var(--status-info)' }} />]}
                        options={{ interpolation: { escapeValue: false } }}
                    />
                );
            }
            case LogTypes.SELL: {
                const { sold_for } = extra;
                const display_sold_for = sold_for;

                // Note: sold_for typically comes as a string with currency symbol in this context,
                // but if it's a raw number or if we need to parse it, we might need more logic.
                // Assuming 'sold_for' for now remains as is unless we want to parse string prices which is risky.
                // However, usually LogTypes.SELL sold_for is a formatted string.
                // If we want to convert it, we would need the raw value.
                // Let's stick to PROFIT/LOST which use extra.profit (number) and extra.currency.

                return (
                    <Localize
                        i18n_default_text='<0>Sold for</0>: {{sold_for}}'
                        values={{ sold_for: display_sold_for }}
                        components={[<Text key={0} size='xxs' styles={{ color: 'var(--status-warning)' }} />]}
                    />
                );
            }
            case LogTypes.PROFIT: {
                const { currency, profit } = extra;
                let display_currency = currency;
                let display_profit = profit;

                if (is_kes_enabled && kes_rate) {
                    display_currency = 'KES';
                    display_profit = Number(profit) * kes_rate;
                }

                return (
                    <Localize
                        i18n_default_text='Profit amount: <0>{{profit}}</0>'
                        values={{
                            profit: `${formatMoney(display_currency, display_profit, true)} ${getCurrencyDisplayCode(display_currency)}`,
                        }}
                        components={[<Text key={0} size='xxs' styles={{ color: 'var(--status-success)' }} />]}
                    />
                );
            }
            case LogTypes.LOST: {
                const { currency, profit } = extra;
                let display_currency = currency;
                let display_profit = profit;

                if (is_kes_enabled && kes_rate) {
                    display_currency = 'KES';
                    display_profit = Number(profit) * kes_rate;
                }

                return (
                    <Localize
                        i18n_default_text='Loss amount: <0>{{profit}}</0>'
                        values={{
                            profit: `${formatMoney(display_currency, display_profit, true)} ${getCurrencyDisplayCode(display_currency)}`,
                        }}
                        components={[<Text key={0} size='xxs' styles={{ color: 'var(--status-danger)' }} />]}
                    />
                );
            }
            case LogTypes.WELCOME_BACK: {
                const { current_currency } = extra;
                if (current_currency)
                    return (
                        <Localize
                            i18n_default_text='Welcome back! Your messages have been restored. You are using your {{current_currency}} account.'
                            values={{
                                current_currency,
                            }}
                        />
                    );
                return <Localize i18n_default_text='Welcome back! Your messages have been restored.' />;
            }

            case LogTypes.WELCOME: {
                const { current_currency } = extra;
                if (current_currency)
                    return (
                        <Localize
                            i18n_default_text='You are using your {{current_currency}} account.'
                            values={{
                                current_currency,
                            }}
                        />
                    );
                break;
            }
            default:
                return null;
        }
    };

    return <div className={classnames('journal__text', className)}>{getLogMessage()}</div>;
});

export default FormatMessage;
