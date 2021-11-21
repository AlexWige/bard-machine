import { writable } from "svelte/store";
import _ from 'lodash';

function createSoundStore() {
	const { subscribe, set, update } = writable([{
        sounds : [],
        playingSounds : [],
        selectedSounds : []
    }]);

	return {
		subscribe,
        update,
        set,
        removeSound: (soundData) => {
            update(store => {
                if(store.sounds.includes(soundData)) {
                    _.remove(store.sounds, soundData);
                }
                return store;
            })
        },
		addPlayingSound: (token) => {
            update(store => {
                if(!store.playingSounds.includes(token)) {
                    store.playingSounds.push(token);
                };
                return store;
            })
        },
        removePlayingSound: (token) => {
            update(store => {
                if(store.playingSounds.includes(token)) {
                    _.remove(store.playingSounds, token);
                };
                return store;
            })
        },
		addSelectedSound: (selectionAPI) => {
            update(store => {
                if(!store.selectedSounds.includes(selectionAPI)) {
                    store.selectedSounds.push(selectionAPI);
                };
                return store;
            })
        },
        removeSelectedSound: (selectionAPI) => {
            update(store => {
                if(store.selectedSounds.includes(selectionAPI)) {
                    _.remove(store.selectedSounds, selectionAPI);
                };
                return store;
            })
        },
        isSoundSelected: (selectionAPI) => {
            let isSelected = false;
            update(store => {
                isSelected = store.selectedSounds.includes(selectionAPI);
                return store;
            })
            return isSelected;
        },
        stopAllInCategory: (category) => {
            update(store => {
                for (let i = store.playingSounds.length - 1; i >= 0; i--) {
                    if(store.playingSounds[i].category() == category) {
                        store.playingSounds[i].setPlaying(false);
                    }
                }
                return store;
            })
        },
        stopAll: () => {
            update(store => {
                for (let i = store.playingSounds.length - 1; i >= 0; i--) {
                    store.playingSounds[i].setPlaying(false);
                }
                return store;
            })
        },
        toJSON: () => {
            let result;
            update(store => { 
                result = JSON.stringify(store.sounds); 
                return store; 
            })
            return result;
        },
        fromJSON: (jsonData) => {
            let sounds = [];
            try {
                sounds = JSON.parse(jsonData);
            } catch {
                sounds = [];
            }
            update(store => { 
                store.sounds = sounds; 
                return store; 
            })
        }
	};
}

const soundStore = createSoundStore();

export default soundStore;