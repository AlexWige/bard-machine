import _ from 'lodash';
import { collectionPath } from '../collection-paths';
const path = require('path');

export class SoundData {
    constructor(category, sources) {
        this.sources = sources;
        this.title = sources.length == 1 ? sources[0].title : "New Playlist";
        this.category = category;
        this.volume = category == 'music' ? 0.6 : 0.8;
        this.hotkeyCode = -1;
        this.hotkeyName = '';
        this.rooms = {};
    }
}

export class SoundDataRoomOptions {
    constructor(isPlaying, volume) {
        this.isPlaying = isPlaying;
        this.volume = volume;
    }
}

export function getNewSourceID(soundData) {
    const ids = soundData.sources.map(s => s.id);
    if(ids.length == 0) return 0;
    return Math.max(...ids) + 1;
}

export class SoundDataSource
{
    constructor(absolutePath) {
        this.absolutePath = absolutePath;
        this.relativePath = this.getRelativePath(absolutePath);
        this.title = this.processTitle(absolutePath);
        this.isMissing = false;
        this.id = 0;
    }

    processTitle(_path) {
        var parts = _path.split('\\');
        var title = parts[parts.length - 1];
        title = title.substring(0, title.indexOf('.'));
        title = title.replace(/_/g, ' ');
        title = _.startCase(title);
        return title;
    }

    getRelativePath(_absolutePath) {
        return path.relative(path.dirname(collectionPath.get()), _absolutePath);
    }
}