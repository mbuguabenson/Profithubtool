import AppStore from './app-store';
import BlocklyStore from './blockly-store';
import BulkTradeStore from './bulk-trade-store';
import ChartStore from './chart-store';
import ClientStore from './client-store';
import CommonStore from './common-store';
import CopyTradingStore from './copy-trading-store';
import DashboardStore from './dashboard-store';
import DataCollectionStore from './data-collection-store';
import DigitAnalysisStore from './digit-analysis-store';
import FlyoutHelpStore from './flyout-help-store';
import FlyoutStore from './flyout-store';
import GoogleDriveStore from './google-drive-store';
import JournalStore from './journal-store';
import LoadModalStore from './load-modal-store';
import ManualTradeStore from './manual-trade-store';
import QuickStrategyStore from './quick-strategy-store';
import RunPanelStore from './run-panel-store';
import SaveModalStore from './save-modal-store';
import SelfExclusionStore from './self-exclusion-store';
import SpeedBotStore from './speed-bot-store';
import SummaryCardStore from './summary-card-store';
import ToolbarStore from './toolbar-store';
import ToolboxStore from './toolbox-store';
import TradingHubStore from './trading-hub-store';
import TransactionsStore from './transactions-store';
import UiStore from './ui-store';

export default class RootStore {
    public dbot;
    public app: AppStore;
    public summary_card: SummaryCardStore;
    public flyout: FlyoutStore;
    public flyout_help: FlyoutHelpStore;
    public google_drive: GoogleDriveStore;
    public journal: JournalStore;
    public load_modal: LoadModalStore;
    public run_panel: RunPanelStore;
    public save_modal: SaveModalStore;
    public transactions: TransactionsStore;
    public toolbar: ToolbarStore;
    public toolbox: ToolboxStore;
    public quick_strategy: QuickStrategyStore;
    public self_exclusion: SelfExclusionStore;
    public dashboard: DashboardStore;
    public copy_trading: CopyTradingStore;
    public digit_analysis: DigitAnalysisStore;
    public bulk_trade: BulkTradeStore;
    public trading_hub: TradingHubStore;
    public speed_bot: SpeedBotStore;
    public manual_trade: ManualTradeStore;

    public chart_store: ChartStore;
    public blockly_store: BlocklyStore;
    public data_collection_store: DataCollectionStore;

    public ui: UiStore;
    public client: ClientStore;
    public common: CommonStore;

    public core: {
        ui: UiStore;
        client: ClientStore;
        common: CommonStore;
    } = {
        ui: {} as UiStore,
        client: {} as ClientStore,
        common: {} as CommonStore,
    };

    constructor(dbot: unknown) {
        this.dbot = dbot;

        this.ui = new UiStore();
        this.client = new ClientStore();
        this.common = new CommonStore();
        this.core = {
            ui: this.ui,
            client: this.client,
            common: this.common,
        };

        this.app = new AppStore(this, this.core);
        this.summary_card = new SummaryCardStore(this, this.core);
        this.flyout = new FlyoutStore(this);
        this.flyout_help = new FlyoutHelpStore(this);
        this.google_drive = new GoogleDriveStore(this);
        this.journal = new JournalStore(this, this.core);
        this.load_modal = new LoadModalStore(this, this.core);
        this.run_panel = new RunPanelStore(this, this.core);
        this.save_modal = new SaveModalStore(this);
        this.transactions = new TransactionsStore(this, this.core);
        this.toolbar = new ToolbarStore(this);
        this.toolbox = new ToolboxStore(this, this.core);
        this.quick_strategy = new QuickStrategyStore(this);
        this.self_exclusion = new SelfExclusionStore(this, this.core);
        this.dashboard = new DashboardStore(this, this.core);
        this.copy_trading = new CopyTradingStore(this);

        this.chart_store = new ChartStore(this);
        this.blockly_store = new BlocklyStore(this);
        this.data_collection_store = new DataCollectionStore(this, this.core);
        this.digit_analysis = new DigitAnalysisStore(this);
        this.bulk_trade = new BulkTradeStore(this);
        this.trading_hub = new TradingHubStore(this);
        this.speed_bot = new SpeedBotStore(this);
        this.manual_trade = new ManualTradeStore(this);
    }
}
