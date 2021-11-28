import _, { isArguments } from "lodash";
import { writable } from "svelte/store";
import * as selectionManager from "./SelectionManager";

// Context menu svelte element
let contextMenuAPI;

// List of clickable elements apis
export let clickables = [];

// Last collection of clickable apis
let lastClickablesSelection = [];

// **OPTIONS** in clickable elements in api contain:
    // id: 'remove-sound-block',
    // solo: 'Remove Sound',
    // multiple: 'Remove Sounds',
    // onClickEach: () => {}
    // onClickAll: () => {}


/******* LIST MANAGEMENT ******/

export function register(api) {
    if(!clickables.includes(api)) {
        clickables.push(api);
    }
}

export function unregister(api) {
    if(clickables.includes(api)) {
        _.remove(clickables, api);
    }
}

export function setContextMenuAPI(api) {
    contextMenuAPI = api;
}

/****** UTILITY ******/

export function show(x, y, options) {
    return contextMenuAPI.show(x, y, options);
}

export function hide() {
    return contextMenuAPI.hide();
}

export function getLastClickablesSelection() {
    return lastClickablesSelection;
}

function findAPIFromNode(node) {
    return clickables.find(api => api.getNode() == node);
}

function findAPIFromPath(path) {
    const node = path.find(node => findAPIFromNode(node));
    if(node) return findAPIFromNode(node);
}

function findClickablesInCurrentSelection() {
    const allClickableNodes = clickables.map(api => api.getNode());
    const clickableNodesInSelection = selectionManager.selected
        .map(api => api.getNode())
        .filter(node => allClickableNodes.includes(node));
    return clickableNodesInSelection.map(node => findAPIFromNode(node)).filter(api => api);
}

function getOptionsFor(apis) {
    // Array of displayed options to output
    // Elements contain:
    //     id: 'remove-sound-block',
    //     name: 'Remove sounds',
    //     onClick: [() => {}, () => {}],
    //     toRemove: false
    let displayedOptions = [];

    apis.forEach(api => {
        const options = api.getOptions();
        options.forEach(option => {
            // Find option with the same id already included in array
            const similarIncluded = displayedOptions.find(o => o.id == option.id);
            
            if(similarIncluded) {
                if(!option.multiple) similarIncluded.toRemove = true;
                else {
                    similarIncluded.name = option.multiple;
                    if(option.onClickEach) similarIncluded.onClick.push(option.onClickEach);
                    similarIncluded.toRemove = false;
                }
            }
            else {
                const onClick = [];
                if(option.onClickAll) onClick.push(option.onClickAll);
                if(option.onClickEach) onClick.push(option.onClickEach);
                displayedOptions.push({
                    id: option.id,
                    name: option.solo ?? option.multiple,
                    onClick: onClick,
                    toRemove: !option.solo,
                    saveAfter: option.saveAfter
                });
            }
        });
    });

    displayedOptions.forEach(option => {
        option.onClick.push(() => hide());
    });

    // Prune options to remove and return
    return displayedOptions.filter(o => !o.toRemove);
}

/****** POINTER EVENTS ******/

export function onLeftClick(e) {
    if(!e.path.find(node => node.id == 'context-menu')) {
        contextMenuAPI?.hide();
    }
}

export function onRightClick(e) {
    const apis = [];

    // Element behind pointer
    const clicked = findAPIFromPath(e.path);
    if(clicked) apis.push(clicked);

    // If clicked on selection, use all in selection
    if(selectionManager.findAPIFromPath(e.path)) {
        const selectedAPIs = findClickablesInCurrentSelection().filter(api => api != clicked);
        if(selectedAPIs.length > 0) apis.push(...selectedAPIs);
    }

    lastClickablesSelection = apis;

    const options = getOptionsFor(apis);

    if(options.length == 0) {
        contextMenuAPI.hide();
        return false;
    } else {
        contextMenuAPI.show(e.clientX, e.clientY, options);
        return true;
    }
}