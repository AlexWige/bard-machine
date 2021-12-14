import _ from 'lodash';
import { collectionPath } from '../collection-paths';
const path = require('path');

export class SoundData {
    constructor(absolutePath, category) {
        // this.sources = [
        //     { 
        //         title: '',
        //         absolutePath: '',
        //         relativePath: ''
        //     }
        // ]
        this.path = {
            absolute: absolutePath,
            relative: path.relative(path.dirname(collectionPath.get()), absolutePath)
        };
        this.category = category;
        this.volume = category == 'music' ? 0.6 : 0.8;
        this.title = this.processTitle(absolutePath);
        this.hotkeyCode = -1;
        this.hotkeyName = '';
        this.missingFile = false;
    }

    processTitle(_path) {
        var parts = _path.split('\\');
        var title = parts[parts.length - 1];
        title = title.substring(0, title.indexOf('.'));
        title = title.replace(/_/g, ' ');
        title = _.startCase(title);
        return title;
    }
}