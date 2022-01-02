import { globalVolume } from '../player-store';
import { get } from 'svelte/store';

let fadingItems = [];
const intervalDelay = 50;
const moveDelta = 0.05;

class FadingItem {
    constructor(api) {
        this.api = api;
        this.needsUpdate = false;
        this.playFade = 0;
        this.dataVolumeFade = api.getDataVolume();
    }
}

export function register(api) {
    fadingItems.push(new FadingItem(api));
    update(api);
}

export function unregister(api) {
    fadingItems = fadingItems.filter(item => item.api != api);
}

export function update(api) {
    const item = fadingItems.find(item => item.api == api);
    if(item) {
        item.needsUpdate = true;
        tickItem(item);
    }
}

export function onGlobalVolumeChange() {
    fadingItems.forEach(item => applyItemVolumes(item));
}

export function skipPlayFade(api) {
    const item = findItemWithAPI(api);
    if(!item) return;
    item.playFade = item.api.getPlayState() ? 1 : 0;
    applyItemVolumes(item);
}

export function skipDataVolumeFade(api) {
    const item = findItemWithAPI(api);
    if(!item) return;
    item.dataVolumeFade = item.api.getDataVolume();
    applyItemVolumes(item);
}

function findItemWithAPI(api) {
    return fadingItems.find(item => item.api == api);
}

function tickAll() {
    fadingItems.forEach(item => tickItem(item));
}

function tickItem(item) {
    if(!item.needsUpdate) return;

    const targetPlayFade = item.api.getPlayState() ? 1 : 0;
    item.playFade = goToward(item.playFade, targetPlayFade, moveDelta);
    if(targetPlayFade == 1) item.api.setSoundPlaying(true);

    const targetDataVolume = item.api.getDataVolume();
    item.dataVolumeFade = goToward(item.dataVolumeFade, targetDataVolume, moveDelta);

    item.needsUpdate = (targetPlayFade != item.playFade) || (targetDataVolume != item.dataVolumeFade);
    applyItemVolumes(item);
}

function applyItemVolumes(item) {
    item.api.setSoundVolume(item.playFade * item.dataVolumeFade * get(globalVolume));
}

function goToward(current, target, delta) {
    if(current < target) return Math.min(target, current + delta);
    else if(current > target) return Math.max(target, current - delta);
    else return target;
}


setInterval(tickAll, intervalDelay);