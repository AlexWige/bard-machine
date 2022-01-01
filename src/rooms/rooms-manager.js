import { writable } from "svelte/store";
import Room from "./room";
import roomsStore from "./rooms-store";
import collectionLoader from "../collection-loader";
import soundStore from "../sound-blocks/sound-store";

export const mainRoom = writable(new Room('Main', 0, true));
let roomsAPIs = [];

export function onAppMount() {
    window.addEventListener('collection-opened', onCollectionOpened);
}

export function onAppDestroy() {
    window.removeEventListener('collection-opened', onCollectionOpened);
}

function onCollectionOpened() {
    setRoomActive(0);
}

export function createRoom(name) {
    const activeRoomID = getActiveRoomID();
    const newRoomID = getNewID();
    roomsStore.update(store => {
        store.push(new Room(name, newRoomID));
        return store;
    });
    // Copy current state
    soundStore.update(store => {
        store.forEach(sound => {
            sound.data.rooms['R' + newRoomID] = sound.data.rooms['R' + activeRoomID];
        });
        return store;
    });
    refreshPlayingCounts();
    // Open new room
    setRoomActive(newRoomID);
    collectionLoader.saveCollection();
}

export function getRoomActiveSoundTitleList(roomID) {
    const soundData = soundStore.getAllData();
    
    return {
        music: soundData.filter(data => data.category == 'music' && data.rooms['R' + roomID]?.isPlaying)
                .map(data => data.title),
        ambient: soundData.filter(data => data.category == 'ambient' && data.rooms['R' +roomID]?.isPlaying)
            .map(data => data.title),
    };
}

export function refreshPlayingCounts() {
    const soundData = soundStore.getAllData();
    roomsStore.update(store => {
        store.forEach(room => {
            room.playingMusic = soundData.filter(data => data.category == 'music' && data.rooms['R' + room.id]?.isPlaying).length;
            room.playingAmbient = soundData.filter(data => data.category == 'ambient' && data.rooms['R' + room.id]?.isPlaying).length;
        });
        return store;
    });
}

export function getActiveRoomID() {
    let id;
    roomsStore.update(store => {
        const activeRoom = store.find(r => r.isActive);
        if(!activeRoom) id = 0;
        else id = activeRoom.id;
        return store;
    });
    return id;
}

export function getRoomByID(id) {
    let room;
    roomsStore.update(store => {
        room = store.find(r => r.id == id);
        return store;
    });
    return room;
}

export function setRoomActive(id) {
    mainRoom.update(room => {
        room.isActive = id == 0;
        return room;
    });
    roomsStore.update(store => {
        store.forEach(room => {
            room.isActive = room.id == id;
        });
        return store;
    });
    soundStore.update(store => {
        store.forEach(sound => {
            if(sound && sound.api) {
                const shouldPlay = id != 0 && sound.data.rooms['R' + id]?.isPlaying;
                sound.api.setPlaying(shouldPlay);
                if(id != 0 && sound.data.rooms['R' + id]?.volume !== undefined) 
                    sound.api.setVolume(sound.data.rooms['R' + id].volume)
            }
        });
        return store;
    });
}

export function registerRoomAPI(api) {
    if(!roomsAPIs.includes(api)) roomsAPIs.push(api);
}

export function unregisterRoomAPI(api) {
    roomsAPIs = roomsAPIs.filter(a => a != api);
}

export function getRoomIDFromNode(node) {
    return roomsAPIs.find(api => api.getNode() == node).getID();
}

function getNewID() {
    let currentIDs = [];
    roomsStore.update(store => {
        currentIDs = store.map(room => room.id);
        return store;
    });
    let max = Math.max(...currentIDs, 0);
    return ++max;
}