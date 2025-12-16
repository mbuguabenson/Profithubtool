import React from 'react';
import { observer } from 'mobx-react-lite';
import { formatMoney, getCurrencyDisplayCode } from '@/components/shared';
import { useStore } from '@/hooks/useStore';

type TMoneyProps = {
    amount: number | string;
    className: string;
    currency: string;
    has_sign: boolean;
    should_format: boolean;
    show_currency: boolean; // if true, append currency symbol
};

const Money = observer(
    ({
        amount = 0,
        className,
        currency = 'USD',
        has_sign,
        should_format = true,
        show_currency = false,
    }: Partial<TMoneyProps>) => {
        const { client } = useStore();
        const { is_kes_enabled, kes_rate } = client;

        let final_currency = currency;
        let final_amount_value = amount;

        if (is_kes_enabled && kes_rate && currency !== 'KES') {
            final_currency = 'KES';
            final_amount_value = Number(amount) * kes_rate;
        }

        let sign = '';
        if (Number(final_amount_value) && (Number(final_amount_value) < 0 || has_sign)) {
            sign = Number(final_amount_value) > 0 ? '+' : '-';
        }

        // if it's formatted already then don't make any changes unless we should remove extra -/+ signs
        const value = has_sign || should_format ? Math.abs(Number(final_amount_value)) : final_amount_value;
        const final_amount = should_format ? formatMoney(final_currency, value, true, 0, 0) : value;

        return (
            <React.Fragment>
                <span>{has_sign && sign}</span>
                <span data-testid='dt_span' className={className}>
                    {final_amount} {show_currency && getCurrencyDisplayCode(final_currency)}
                </span>
            </React.Fragment>
        );
    }
);

export default Money;
