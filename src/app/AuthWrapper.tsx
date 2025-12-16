import React from 'react';
import ChunkLoader from '@/components/loader/chunk-loader';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { AuthManager } from '@/utils/AuthManager';
import { localize } from '@deriv-com/translations';
import App from './App';

export const AuthWrapper = () => {
    const [isAuthComplete, setIsAuthComplete] = React.useState(false);
    const { isOnline } = useOfflineDetection();

    React.useEffect(() => {
        const initializeAuth = async () => {
            // Check for tokens in URL first (Callback flow)
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.has('token1') || searchParams.has('acct1') || window.location.search.includes('token')) {
                const processed = await AuthManager.processCallback();
                if (processed) {
                    console.log('[AuthWrapper] Auth processed successfully');
                }
            }

            // Fallback for offline or already logged in states
            setIsAuthComplete(true);
        };

        initializeAuth();
    }, [isOnline]);

    if (!isAuthComplete && window.location.search.includes('token')) {
        return <ChunkLoader message={localize('Processing authentication...')} />;
    }

    return <App />;
};
