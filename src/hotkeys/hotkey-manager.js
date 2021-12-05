import soundStore from "../sound-blocks/soundStore";
import collectionLoader from "../collectionLoader";
import { writable } from "svelte/store";
const { ipcRenderer } = window.require('electron');

export const inputModalActive = writable(false);

let inputModalAPI = undefined;

export function onAppMount() {
    window.addEventListener('keydown', onKeyDown);
}

export function onAppDestroy() {
    window.removeEventListener('keydown', onKeyDown);
}

function onKeyDown(event) {
    if(event.ctrlKey) {
            if(event.keyCode == 78) {
            ipcRenderer.send('dialog-create-collection');
        }
        else if(event.keyCode == 79) {
            ipcRenderer.send('dialog-open-collection');
        }
        else if(event.keyCode == 75) {
            soundStore.stopAll();
        }
    }
}

export function registerInputModal(api) {
    inputModalAPI = api;
}

export function getInputModal() {
    return inputModalAPI;
}

export function getSoundWithHotkey(keyCode) {
    let sound;
    soundStore.update(store => {
        sound = store.find(s => s.data.hotkeyCode == keyCode);
        return store;
    });
    return sound;
}

export function setSoundHotkey(soundID, keyCode, keyName) {
    soundStore.update(store => {
        store.forEach(item => {
            if(item.data.hotkeyCode == keyCode) {
                item.data.hotkeyCode = '';
                item.data.hotkeyName = '';
            }
            if(item.id == soundID) {
                item.data.hotkeyCode = keyCode;
                item.data.hotkeyName = keyName;
            }
        });
        return store;
    });
    collectionLoader.saveCollection();
}
