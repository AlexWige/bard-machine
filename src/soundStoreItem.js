import _ from 'lodash';

export class SoundStoreItem {
    constructor(id, soundData) {
        this.id = id;
        this.data = soundData;
        this.api = undefined;
    }
}

export function getNewID(sounds) {
    const ids = sounds.map(s => s.id);
    for(let i = 0; i < ids.length + 1; i++) {
        if(ids.indexOf(i) == -1) return i;
    }
}