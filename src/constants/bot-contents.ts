type TTabsTitle = {
    [key: string]: string | number;
};

type TDashboardTabIndex = {
    [key: string]: number;
};

export const tabs_title: TTabsTitle = Object.freeze({
    WORKSPACE: 'Workspace',
    CHART: 'Chart',
    BOTS: 'Bots',
});

export const DBOT_TABS: TDashboardTabIndex = Object.freeze({
    DASHBOARD: 0,
    BOT_BUILDER: 1,
    CHART: 2,
    TUTORIAL: 3,
    PRO_ANALYSIS: 4,
    BOTS: 5,
    COPY_TRADING: 6,
    RISK_MANAGEMENT: 7,
    DIGIT_ANALYSIS: 8,
    BULK_TRADER: 9,
});

export const BOT_SUB_TABS = {
    DASHBOARD: 0,
    BOT_BUILDER: 1,
    CHART: 2,
    TUTORIAL: 3,
    BOTS: 5,
    COPY_TRADING: 6,
    RISK_MANAGEMENT: 7,
    DIGIT_ANALYSIS: 8,
};

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-charts',
    'id-tutorials',
    'id-pro-analysis',
    'id-bots-list',
    'id-copy-trading',
    'id-risk-management',
    'id-digits-analysis',
    'id-bulk-trader',
];

export const DEBOUNCE_INTERVAL_TIME = 500;
