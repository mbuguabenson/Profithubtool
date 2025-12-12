import { LocalStorageConstants, LocalStorageUtils, URLUtils } from '@deriv-com/utils';

export const APP_IDS = {
    LOCALHOST: 114784, // Default for local dev
    TMP_STAGING: 114784,
    STAGING: 114784, // TODO: Update with real staging ID if different
    STAGING_BE: 114784,
    STAGING_ME: 114784,
    PRODUCTION: 114784, // Example production ID - needs verification
    PRODUCTION_BE: 114784,
    PRODUCTION_ME: 114784,
};

export const livechat_license_id = 12049137;
export const livechat_client_id = '66aa088aad5a414484c1fd1fa8a5ace7';

export const domain_app_ids = {
    'master.bot-standalone.pages.dev': APP_IDS.TMP_STAGING,
    'staging-dbot.deriv.com': APP_IDS.STAGING,
    'staging-dbot.deriv.be': APP_IDS.STAGING_BE,
    'staging-dbot.deriv.me': APP_IDS.STAGING_ME,
    'dbot.deriv.com': APP_IDS.PRODUCTION,
    'dbot.deriv.be': APP_IDS.PRODUCTION_BE,
    'dbot.deriv.me': APP_IDS.PRODUCTION_ME,
    'app.deriv.com': APP_IDS.PRODUCTION,
    localhost: APP_IDS.LOCALHOST,
};

export const getCurrentProductionDomain = () =>
    !/^staging\./.test(window.location.hostname) &&
    Object.keys(domain_app_ids).find(domain => window.location.hostname === domain);

export const isProduction = () => {
    const all_domains = Object.keys(domain_app_ids).map(domain => `(www\\.)?${domain.replace('.', '\\.')}`);
    return new RegExp(`^(${all_domains.join('|')})$`, 'i').test(window.location.hostname);
};

export const isTestLink = () => {
    return (
        window.location.origin?.includes('.binary.sx') ||
        window.location.origin?.includes('bot-65f.pages.dev') ||
        window.location.origin?.includes('.vercel.app') ||
        window.location.origin?.includes('.netlify.app') ||
        isLocal()
    );
};

export const isLocal = () => /localhost(:\d+)?$/i.test(window.location.hostname);

const getDefaultServerURL = () => {
    if (isTestLink()) {
        return 'ws.derivws.com';
    }

    let active_loginid_from_url;
    const search = window.location.search;
    if (search) {
        const params = new URLSearchParams(document.location.search.substring(1));
        active_loginid_from_url = params.get('acct1');
    }

    const loginid = window.localStorage.getItem('active_loginid') ?? active_loginid_from_url;
    const is_real = loginid && !/^(VRT|VRW)/.test(loginid);

    const server = is_real ? 'green' : 'blue';
    const server_url = `${server}.derivws.com`;

    return server_url;
};

export const getDefaultAppIdAndUrl = () => {
    const server_url = getDefaultServerURL();

    if (isTestLink()) {
        return { app_id: APP_IDS.LOCALHOST, server_url };
    }

    const current_domain = getCurrentProductionDomain() ?? '';
    const app_id = domain_app_ids[current_domain as keyof typeof domain_app_ids] ?? APP_IDS.PRODUCTION;

    return { app_id, server_url };
};

export const getAppId = (): number => {
    const config_app_id = localStorage.getItem('config.app_id');
    if (config_app_id) {
        return parseInt(config_app_id);
    }

    // Default universal fallback
    return 114784;
};

export const getSocketURL = () => {
    const local_storage_server_url = window.localStorage.getItem('config.server_url');
    if (local_storage_server_url) return local_storage_server_url;

    const server_url = getDefaultServerURL();

    return server_url;
};

export const checkAndSetEndpointFromUrl = () => {
    if (isTestLink()) {
        const url_params = new URLSearchParams(location.search.slice(1));

        if (url_params.has('qa_server') && url_params.has('app_id')) {
            const qa_server = url_params.get('qa_server') || '';
            const app_id = url_params.get('app_id') || '';

            url_params.delete('qa_server');
            url_params.delete('app_id');

            if (/^(^(www\.)?qa[0-9]{1,4}\.deriv.dev|(.*)\.derivws\.com)$/.test(qa_server) && /^[0-9]+$/.test(app_id)) {
                localStorage.setItem('config.app_id', app_id);
                localStorage.setItem('config.server_url', qa_server.replace(/"/g, ''));
            }

            const params = url_params.toString();
            const hash = location.hash;

            location.href = `${location.protocol}//${location.hostname}${location.pathname}${params ? `?${params}` : ''
                }${hash || ''}`;

            return true;
        }
    }

    return false;
};

export const getDebugServiceWorker = () => {
    const debug_service_worker_flag = window.localStorage.getItem('debug_service_worker');
    if (debug_service_worker_flag) return !!parseInt(debug_service_worker_flag);

    return false;
};

/**
 * Generates the redirect URI that strictly matches the current origin + pathname.
 * This is crucial for OAuth compliance.
 */
export const getRedirectUri = () => {
    // Current window URL without query parameters or hash
    const origin = window.location.origin;
    const pathname = window.location.pathname;

    // Ensure we don't end up with double slashes if pathname is just '/'
    const uri = `${origin}${pathname}`;

    // NOTE: Some OAuth setups strictly require a trailing slash, others forbid it.
    // Based on previous code, we'll strip trailing slash unless it's root, or maybe just follow strict window.location match
    // Standardizing on: No trailing slash unless it's root '/'

    // However, the previous code forced a trailing slash:
    // currentUrl.endsWith('/') ? currentUrl : currentUrl + '/'

    // Let's stick to what likely works: strict match to what the browser shows
    return uri;
};

export const generateOAuthURL = () => {
    const { getOauthURL } = URLUtils;
    const oauth_url = getOauthURL();
    const original_url = new URL(oauth_url);
    const hostname = window.location.hostname;

    // Use centralized redirect logic
    const redirectUri = getRedirectUri();
    original_url.searchParams.set('redirect_uri', redirectUri);

    // Explicitly set the App ID based on our configuration
    const app_id = getAppId();
    original_url.searchParams.set('app_id', app_id.toString());

    // First priority: Check for configured server URLs (for QA/testing environments)
    const configured_server_url = (LocalStorageUtils.getValue(LocalStorageConstants.configServerURL) ||
        localStorage.getItem('config.server_url')) as string;

    const valid_server_urls = ['green.derivws.com', 'red.derivws.com', 'blue.derivws.com', 'canary.derivws.com'];

    if (
        configured_server_url &&
        (typeof configured_server_url === 'string'
            ? !valid_server_urls.includes(configured_server_url)
            : !valid_server_urls.includes(JSON.stringify(configured_server_url)))
    ) {
        original_url.hostname = configured_server_url;
    } else if (original_url.hostname.includes('oauth.deriv.')) {
        // Second priority: Domain-based OAuth URL setting for .me and .be domains
        if (hostname.includes('.deriv.me')) {
            original_url.hostname = 'oauth.deriv.me';
        } else if (hostname.includes('.deriv.be')) {
            original_url.hostname = 'oauth.deriv.be';
        } else if (hostname === 'localhost' || hostname === '127.0.0.1' || /^localhost:\d+$/.test(hostname)) {
            // Explicitly handle localhost to use production OAuth
            original_url.hostname = 'oauth.deriv.com';
        } else {
            // Fallback to original logic for other domains
            const current_domain = getCurrentProductionDomain();
            if (current_domain) {
                const domain_suffix = current_domain.replace(/^[^.]+\./, '');
                original_url.hostname = `oauth.${domain_suffix}`;
            }
        }
    }
    return original_url.toString() || oauth_url;
};
