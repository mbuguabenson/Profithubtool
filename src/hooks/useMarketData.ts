import { useEffect } from 'react';
import marketDataEngine from '@/services/market-data-engine';

export const useActiveSymbols = () => {
    return marketDataEngine.active_symbols;
};

export const useMarketTick = (symbol: string) => {
    useEffect(() => {
        if (symbol) {
            marketDataEngine.subscribeToTick(symbol);
        }
        return () => {
            if (symbol) {
                // Optional: Decide if we want to unsubscribe immediately or keep hot
                // marketDataEngine.unsubscribeFromTick(symbol);
            }
        };
    }, [symbol]);

    return {
        tick: marketDataEngine.latest_ticks.get(symbol),
        history: marketDataEngine.tick_history.get(symbol) || [],
    };
};

export const useLastDigit = (symbol: string) => {
    const { tick } = useMarketTick(symbol);
    return tick?.digit;
};
