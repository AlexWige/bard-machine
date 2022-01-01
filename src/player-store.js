import { writable } from "svelte/store";

export const version = '0.8';
export const globalVolume = writable(0.8);
export const bigBlocks = writable(false);
export const onHomeScreen = writable(true);