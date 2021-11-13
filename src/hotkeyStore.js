import { writable } from "svelte/store";
import _ from 'lodash';

function createKeysStore() {
	const { subscribe, set, update } = writable({});

	return {
		subscribe,
        update,
        set,
        removeHotKey(hotKey) {
            update(store => {
                if(store[hotKey]) {
                    store[hotKey].clearKeyCode();
                    delete store[hotKey];
                }
                return store;
            });
        },
        addHotKey(keyCode, keyName, soundAPI) {
            update(store => {
                if(store[keyCode]) {
                    store[keyCode].setKey(undefined, '');
                    store[keyCode] = undefined;
                    delete store[keyCode];
                }
                return store;
            });
            soundAPI.setKey(keyCode, keyName);
            update(store => {
                store[keyCode] = soundAPI;
                return store;
            });
        },
        findAPI(hotKey) {
            let api;
            update(store => {
                api = store[hotKey];
                return store;
            });
            return api;
        }
	};
}

export const hotKeys = createKeysStore();
export const isPromptActive = writable(false);