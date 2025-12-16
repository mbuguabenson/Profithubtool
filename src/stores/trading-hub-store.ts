import { action, makeObservable, observable } from 'mobx';
import type RootStore from './root-store';

export default class TradingHubStore {
    root_store: RootStore;
    active_tab: 'speed' | 'manual' | 'bulk' | 'automated' = 'speed';

    constructor(root_store: RootStore) {
        makeObservable(this, {
            active_tab: observable,
            setActiveTab: action.bound,
        });
        this.root_store = root_store;
    }

    setActiveTab(tab: 'speed' | 'manual' | 'bulk' | 'automated') {
        this.active_tab = tab;
    }
}
