import _ from 'lodash';
import { soundBlockAPIs } from "./soundBlockAPIs";

export class SoundStoreItem {
    constructor(id, soundData) {
        this.id = id;
        this.data = soundData;
    }

    api() {
        return soundBlockAPIs.find(api => api.getID() == this.id);
    }
}

export function getNewID(sounds) {
    const ids = sounds.map(s => s.id);
    for(let i = 0; i < ids.length + 1; i++) {
        if(ids.indexOf(i) == -1) return i;
    }
}