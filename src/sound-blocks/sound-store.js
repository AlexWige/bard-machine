import { writable } from "svelte/store";
import { SoundStoreItem, getNewID } from "./sound-store-item";
import { SoundData, SoundDataSource } from "./sound-data";
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
                    const data = new SoundData(category, [new SoundDataSource(path)]);
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
        getItemFromNode: (node) => {
            if(node && node.classList.contains('sound-block')) {
                if(node.dataset.id) {
                    let item;
                    update(store => {
                        item = store.find(s => s.id == node.dataset.id);
                        return store;
                    })
                    return item;
                }
            }
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
                sounds = store.filter(sound => sound.data.category == category && sound.api?.isPlaying());
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
        getAllData: () => {
            let data;
            update(store => {
                data = store.map(s => s.data);
                return store; 
            })
            return data;
        }
	};
}

const soundStore = createSoundStore();

export default soundStore;