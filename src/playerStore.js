import { writable } from "svelte/store";
import _ from 'lodash';

export const globalVolume = writable(0.8);
export const smallBlocks = writable(true);