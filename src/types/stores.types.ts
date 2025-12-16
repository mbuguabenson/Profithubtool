import ClientStore from '@/stores/client-store';
import CommonStore from '@/stores/common-store';
import DashboardStore from '@/stores/dashboard-store';
import FlyoutStore from '@/stores/flyout-store';
import LoadModalStore from '@/stores/load-modal-store';
import RunPanelStore from '@/stores/run-panel-store';
import SaveModalStore from '@/stores/save-modal-store';
import ToolbarStore from '@/stores/toolbar-store';
import UiStore from '@/stores/ui-store';
import { TWebSocket } from './ws.types';

export type TStores = {
    ui: UiStore;
    client: ClientStore;
    common: CommonStore;
};

export type TDbotStore = {
    client: ClientStore;
    flyout: FlyoutStore;
    toolbar: ToolbarStore;
    save_modal: SaveModalStore;
    dashboard: DashboardStore;
    load_modal: LoadModalStore;
    run_panel: RunPanelStore;
    setLoading: (is_loading: boolean) => void;
    setContractUpdateConfig: (contract_update_config: unknown) => void;
    handleFileChange: (
        event: React.MouseEvent<Element, MouseEvent> | React.FormEvent<HTMLFormElement> | DragEvent,
        is_body?: boolean
    ) => boolean;
    is_mobile: boolean;
};

export type TApiHelpersStore = {
    server_time: CommonStore['server_time'];
    ws: TWebSocket;
};
