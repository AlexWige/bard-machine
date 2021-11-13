import { writable } from "svelte/store";
import _ from 'lodash';

class SoundStoreCategory {
    constructor() {
        this.sounds = [];
        this.playingSounds = [];
    }

    addPlayingSound(soundPlayToken) {
        if(!this.playingSounds.includes(soundPlayToken)) {
            this.playingSounds.push(soundPlayToken);
        };
    }

    removePlayingSound(soundPlayToken) {
        if(this.playingSounds.includes(soundPlayToken)) {
            _.remove(this.playingSounds, soundPlayToken);
        };
    }

    stopAll() {
        this.playingSounds.forEach(soundToken => soundToken.setPlaying(false));
    }
}

function createSoundStore() {
	const { subscribe, set, update } = writable({
        ambient: new SoundStoreCategory(),
        music: new SoundStoreCategory(),
        sfx: new SoundStoreCategory()
    });

	return {
		subscribe,
        update,
        set,
		addPlayingSound: (token) => {
            update(store => {
                store[token.category()].addPlayingSound(token);
                return store;
            })
        },
        removePlayingSound: (token) => {
            update(store => {
                store[token.category()].removePlayingSound(token);
                return store;
            })
        },
        stopAllInCategory: (category) => {
            update(store => {
                if(store[category]) store[category].stopAll();
                return store;
            })
        },
        stopAll: () => {
            update(store => {
                store.music.stopAll();
                store.ambient.stopAll();
                store.sfx.stopAll();
                return store;
            })
        }
	};
}

const soundStore = createSoundStore();

export default soundStore;