import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { TContractInfo, TContractStore } from '@/components/shared/utils/contract/contract-types';
import Text from '@/components/shared_ui/text';
import { TGetContractTypeDisplay } from '@/components/shared_ui/types/common.types';
import { getContractTypeDisplay } from '@/constants/contract';
import { useStore } from '@/hooks/useStore';
import { localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import ContractCardLoader from '../contract-card-loading';
import { getCardLabels } from '../shared';
import RunnerIcon from '../shared/icons/runner-icon';
import ContractCard from '../shared_ui/contract-card';
import { TSummaryCardProps } from './summary-card.types';

const SummaryCard = observer(({ contract_info, is_contract_loading, is_bot_running }: TSummaryCardProps) => {
    const { summary_card, run_panel, ui, common, client } = useStore();
    const { is_contract_completed, is_contract_inactive, is_multiplier, is_accumulator, setIsBotRunning } =
        summary_card;
    const { onClickSell, is_sell_requested, contract_stage } = run_panel;
    const { addToast, current_focus, removeToast, setCurrentFocus } = ui;
    const { server_time } = common;

    const { isDesktop } = useDevice();

    React.useEffect(() => {
        const cleanup = setIsBotRunning();
        return cleanup;
    }, [is_contract_loading, setIsBotRunning]);

    const card_header = (
        <ContractCard.Header
            contract_info={contract_info as TContractInfo}
            display_name={contract_info?.display_name ?? ''}
            getCardLabels={getCardLabels}
            getContractTypeDisplay={getContractTypeDisplay as unknown as TGetContractTypeDisplay}
            has_progress_slider={!is_multiplier}
            is_mobile={!isDesktop}
            is_sell_requested={is_sell_requested}
            is_sold={is_contract_completed}
            onClickSell={onClickSell}
            server_time={server_time}
        />
    );

    const modified_contract_info = React.useMemo(() => {
        if (!contract_info || !client.is_kes_enabled || !client.kes_rate) return contract_info;

        return {
            ...contract_info,
            currency: 'KES',
            buy_price: (contract_info.buy_price || 0) * client.kes_rate,
            bid_price: (contract_info.bid_price || 0) * client.kes_rate,
            profit: (contract_info.profit || 0) * client.kes_rate,
            payout: (contract_info.payout || 0) * client.kes_rate,
        };
    }, [contract_info, client.is_kes_enabled, client.kes_rate]);

    const card_body = (
        <ContractCard.Body
            addToast={addToast}
            contract_info={modified_contract_info as TContractInfo}
            contract_update={(contract_info as TContractInfo)?.contract_update}
            currency={modified_contract_info?.currency ?? ''}
            current_focus={current_focus}
            error_message_alignment='left'
            getCardLabels={getCardLabels}
            getContractById={() => summary_card as unknown as TContractStore}
            has_progress_slider={!is_multiplier}
            is_mobile={!isDesktop}
            is_multiplier={is_multiplier}
            is_accumulator={is_accumulator}
            is_sold={is_contract_completed}
            removeToast={removeToast}
            server_time={server_time}
            setCurrentFocus={setCurrentFocus}
            should_show_cancellation_warning={false}
            toggleCancellationWarning={() => {}}
        />
    );

    const card_footer = (
        <ContractCard.Footer
            contract_info={contract_info as TContractInfo}
            getCardLabels={getCardLabels}
            is_multiplier={is_multiplier}
            is_sell_requested={is_sell_requested}
            onClickSell={onClickSell}
            server_time={server_time}
            onClickCancel={() => {}}
        />
    );

    const contract_el = (
        <React.Fragment>
            {card_header}
            {card_body}
            {card_footer}
        </React.Fragment>
    );

    return (
        <div
            className={classNames('db-summary-card', {
                'db-summary-card--mobile': !isDesktop,
                'db-summary-card--inactive': is_contract_inactive && !is_contract_loading && !contract_info,
                'db-summary-card--completed': is_contract_completed,
                'db-summary-card--completed-mobile': is_contract_completed && !isDesktop,
                'db-summary-card--delayed-loading': is_bot_running,
            })}
            data-testid='dt_mock_summary_card'
        >
            {is_contract_loading && !is_bot_running && <ContractCardLoader speed={2} />}
            {is_bot_running && <ContractCardLoader speed={2} contract_stage={contract_stage} />}
            {!is_contract_loading && contract_info && !is_bot_running && (
                <ContractCard
                    contract_info={modified_contract_info as TContractInfo}
                    getCardLabels={getCardLabels}
                    is_multiplier={is_multiplier}
                    profit_loss={modified_contract_info?.profit ?? 0}
                    should_show_result_overlay={true}
                >
                    <div
                        className={classNames('dc-contract-card', {
                            'dc-contract-card--green': (modified_contract_info?.profit ?? 0) > 0,
                            'dc-contract-card--red': (modified_contract_info?.profit ?? 0) < 0,
                        })}
                    >
                        {contract_el}
                    </div>
                </ContractCard>
            )}
            {!is_contract_loading && !contract_info && !is_bot_running && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.6rem' }}>
                    <RunnerIcon width={96} height={96} fill='var(--text-general)' />
                    <Text as='p' align='center' lineHeight='s' size='xs'>
                        {localize('When you’re ready to trade, hit ')}
                        <strong className='summary-panel-inactive__strong'>{localize('Run')}</strong>
                        {localize('. You’ll be able to track your bot’s performance here.')}
                    </Text>
                </div>
            )}
        </div>
    );
});

export default SummaryCard;
