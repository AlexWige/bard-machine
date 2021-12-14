import { writable } from "svelte/store";
import { SoundStoreItem, getNewID } from "./sound-store-item";
import { SoundData } from "./sound-data";
import _ from "lodash";

function createSoundStore() {
	const { subscribe, set, update } = writable([]);

	return {
		subscribe,
        update,
        set,
        get: () => {
            let content;
            update(store => { content = store; return store; });
            return content;
        },
        closeCollection: () => {
            update(store => []);
        },
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
        renameSound: (id, newName) => {
            update(store => {
                const sound = store.find(s => s.id == id);
                sound.data.title = newName;
                return store;
            });
        },
        removeSound: (id) => {
            update(store => {
                const soundWithID = store.find(s => s.id == id);
                if(soundWithID) _.remove(store, soundWithID);
                return store;
            });
        },
        getItemByID: (id) => {
            let item;
            update(store => {
                item = store.find(s => s.id == id);
                return store;
            })
            return item;
        },
        setSoundAPI: (id, api) => {
            update(store => {
                const item = store.find(s => s.id == id);
                if(item) item.api = api;
                return store;
            })
        },
        getPlayingSoundsInCategory: (category) => {
            let sounds = [];
            update(store => {
                sounds = store.filter(sound => sound.data.category == category && sound.api.isPlaying());
                return store;
            });
            return sounds;
        },
        stopAll: () => {
            update(store => {
                store.forEach(sound => {
                    sound.api.setPlaying(false);
                });
                return store;
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