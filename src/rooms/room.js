export default class Room {
    constructor(name, id, isMain = false) {
        this.name = name;
        this.id = id;
        this.isMain = isMain;
        this.playingMusic = 0;
        this.playingAmbient = 0;
        this.hotkeyCode = -1;
        this.hotkeyName = '';
        this.isActive = isMain;
    }
}