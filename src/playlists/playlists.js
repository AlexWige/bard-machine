import soundStore from "../sound-blocks/sound-store";
import { SoundData } from '../sound-blocks/sound-data';
import { getNewID, SoundStoreItem } from "../sound-blocks/sound-store-item";
import collectionLoader from "../collection-loader";

// Pass SoundStoreItems with 'music' category as argument
export function groupIntoPlaylist(selectedMusics) {
    let playlistItem;
    soundStore.update(store => {
        const sources = selectedMusics
            .sort((a, b) => store.indexOf(a) - store.indexOf(b))
            .map(item => item.data.sources[0]);
        const playlistData = new SoundData('music', sources);
        playlistItem = new SoundStoreItem(getNewID(store), playlistData);
        // Get index of first selected music
        const firstIndex = Math.min(...selectedMusics.map(s => store.indexOf(s)));
        // Add playlist at this index
        store.splice(firstIndex, 0, playlistItem);
        // Remove sounds from playlist
        store = store.filter(sound => !selectedMusics.includes(sound));
        return store;
    });
    collectionLoader.saveCollection();
    return playlistItem;
}

export function ungroupPlaylist(playlist) {
    const sources = playlist.data.sources;
    let ungroupedSounds = [];
    soundStore.update(store => {
        let index = store.indexOf(playlist);
        sources.forEach(source => {
            const soundData = new SoundData('music', [source]);
            const soundStoreItem = new SoundStoreItem(getNewID(store), soundData);
            ungroupedSounds.push(soundStoreItem);
            store.splice(index, 0, soundStoreItem);
            index++;
        });
        store = store.filter(s => s != playlist);
        return store;
    });
    collectionLoader.saveCollection();
    return ungroupedSounds;
}