import _ from 'lodash';

export class SoundData {
    constructor(path, category) {
        this.path = path;
        this.category = category;
        this.volume = category == 'music' ? 0.6 : 0.8;
        this.title = this.processTitle(path);
        this.isPlaying = false;
    }

    processTitle(path) {
        var parts = path.split('\\');
        var title = parts[parts.length - 1];
        title = title.substring(0, title.indexOf('.'));
        title = title.replace(/_/g, ' ');
        title = _.startCase(title);
        return title;
    }
}