import { TContractInfo } from '@/components/shared/utils/contract/contract-types';

export interface TSummaryCardProps {
    contract_info?: TContractInfo | null;
    is_contract_loading: boolean;
    is_bot_running?: boolean;
}
