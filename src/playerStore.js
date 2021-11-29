import { writable } from "svelte/store";
import _ from 'lodash';

export const globalVolume = writable(0.8);
export const bigBlocks = writable(false);
export const onHomeScreen = writable(true);

// Global reference to elements apis
export const apis = {
    inputPrompt: undefined,
    modal: undefined
}