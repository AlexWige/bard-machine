import { writable } from "svelte/store";
import { SoundStoreItem, getNewID } from "./soundStoreItem";
import { SoundData } from "./soundData";
import _ from 'lodash';

function createSoundStore() {
	const { subscribe, set, update } = writable([]);

	return {
		subscribe,
        update,
        set,
        addSounds: (paths, category) => {
            update(store => {
                paths.forEach(path => {
                    const id = getNewID(store);
                    const data = new SoundData(path, category);
                    store.push(new SoundStoreItem(id, data));
                });
                return store;
            });
        },
        removeSound: (id) => {
            update(store => {
                const soundWithID = store.find(s => s.id == id);
                if(soundWithID) _.remove(store, soundWithID);
                return store;
            })
        },
        getItemByID: (id) => {
            let item;
            update(store => {
                item = store.find(s => s.id == id);
                return store;
            })
            return item;
        },
        getSelectedItems: () => {
            let selected = [];
            update(store => {
                store.forEach(item => {
                    if(item.api().isSelected()) selected.push(item);
                });
                return store;
            })
            return selected;
        },
        stopAllInCategory: (category) => {
            update(store => {
                store.forEach(sound => {
                    if(sound.category == category) {
                        sound.api().setPlaying(false);
                    }
                });
                return store;
            });
        },
        stopAll: () => {
            update(store => {
                store.forEach(sound => {
                    sound.api().setPlaying(false);
                    return store;
                });
            });
        },
        toJSON: () => {
            let result = '';
            update(store => {
                const datas = store.map(s => s.data);
                result = JSON.stringify(datas); 
                return store; 
            })
            return result;
        },
        fromJSON: (jsonData) => {
            let datas;
            try {
                datas = JSON.parse(jsonData);
            } catch {
                datas = [];
            }
            update(store => {
                store = [];
                for (let i = 0; i < datas.length; i++) {
                    store.push(new SoundStoreItem(i, datas[i]))
                }
                return store; 
            })
        }
	};
}

const soundStore = createSoundStore();

export default soundStore;