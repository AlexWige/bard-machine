import soundStore from "../sound-blocks/sound-store";
import collectionLoader from "../collection-loader";
import gettableStore from "../utils/gettable-store";
import * as selectionManager from "../pointer/selection";
import { modal } from "../modal/modal-manager";
import { getRoomWithHotkey, setRoomActive } from "../rooms/rooms-manager";
const { ipcRenderer } = window.require('electron');

// Add a function to this to catch key event, if it returns false, the event will stop
let eventCatchers = [];
let inputModalAPI = undefined;

export function onAppMount() {
    window.addEventListener('keydown', onKeyDown);
}

export function onAppDestroy() {
    window.removeEventListener('keydown', onKeyDown);
}

export function addKeyEventCatcher(catcher) {
    if(!eventCatchers.includes(catcher)) eventCatchers.push(catcher);
}

export function removeKeyEventCatcher(catcher) {
    eventCatchers = eventCatchers.filter(c => c != catcher);
}

function onKeyDown(e) {
    // Ignore if inside text input field
    if(document.activeElement.type == 'text') return;
    
    // Ignore certain modifier keys
    const ignoredKeycodes = [16 /*Shift*/, 17 /*Ctrl*/, 144 /*Numlock*/];
    if(ignoredKeycodes.includes(e.keyCode)) return;

    // Check all registered event catchers
    for (let i = 0; i < eventCatchers.length; i++) {
        let continueEvent = eventCatchers[i](e);
        if(!continueEvent) return;
    }
    
    if(!e.ctrlKey && !e.keyCode) e.preventDefault();

    /***** PROGRAM HOTKEYS *****/

    // Ctrl+N → New collection...
    if(e.ctrlKey && e.keyCode == 78) {
        ipcRenderer.send('dialog-create-collection');
        return;
    }
    // Ctrl+O → Open collection...
    if(e.ctrlKey && e.keyCode == 79) {
        ipcRenderer.send('dialog-open-collection');
        return;
    }
    // Ctrl+K → Kill all playing sounds
    if(e.ctrlKey && e.keyCode == 75) {
        soundStore.stopAll();
        return;
    }

    // Left/Right Arrows + Spacebar
    if(e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 32) {
        const selectedSounds = selectionManager.getAllSelected()
            .filter(api => api.getNode().classList.contains('sound-block'))
            .map(api => soundStore.getItemByID(api.getNode().dataset?.id));
        
        // Arrow left/right → reduce/increase volume on selected sounds
        if(e.keyCode == 37 || e.keyCode == 39) {
            selectedSounds.forEach(sound => {
                sound.api.moveVolume(e.keyCode == 37 ? -0.1 : 0.1);
            });
        }
        
        // Spacebar → pause/play volume on selected sounds
        if(e.keyCode == 32) {
            selectedSounds.forEach(sound => {
                const playing = sound.api.isPlaying();
                sound.api.setPlaying(!playing);
            });
        }
        
        return;
    }

    /***** SOUNDS HOTKEYS *****/

    if(!e.ctrlKey && !e.shiftKey) {
        const sound = getSoundWithHotkey(e.keyCode);
        if(sound && sound.api) sound.api.onHotkey();
    }

    if(!e.ctrlKey && !e.shiftKey) {
        const room = getRoomWithHotkey(e.keyCode);
        if(room) setRoomActive(room.id);
    }
}

export function processKeyName(code, name) {
    switch (code) {
        case  8: return "⌫"; 
        case  9: return "⇥"; 
        case 13: return "↵"; 
        case 16: return "⇧"; 
        case 17: return "Ctl"; 
        case 18: return "Alt"; 
        case 20: return "⇪"; 
        case 32: return "␣"; 
        case 33: return "⇞"; 
        case 34: return "⇟"; 
        case 37: return "←"; 
        case 38: return "↑"; 
        case 39: return "→"; 
        case 40: return "↓"; 
        case 46: return "Del"; 
        default: return name.toUpperCase();
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