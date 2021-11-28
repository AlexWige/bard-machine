import _ from 'lodash';

// List of Selectable APIs
export let selectables = [];
export let selected = [];
let lastSelected;

/******* LIST MANAGEMENT ******/

export function register(api) {
    if(!selectables.includes(api)) {
        selectables.push(api);
        // Add class to easily get node list later
        api.getNode().classList.toggle('selectable-node-' + api.getSelectionGroup(), true);
    }
}

export function unregister(api) {
    if(selectables.includes(api)) {
        deselect(api);
        api.getNode().classList.toggle('selectable-node-' + api.getSelectionGroup(), false);
        _.remove(selectables, api);
    }
}

/****** UTILITY ******/

export function findAPIFromNode(node) {
    return selectables.find(api => api.getNode() == node);
}

export function findAPIFromPath(path) {
    const selectableNode = findSelectableNodeInPath(path);
    if(!selectableNode) return;
    return findAPIFromNode(selectableNode);
}

export function findSelectableNodeInPath(path) {
    if(isUnselectable(path)) return;
    return path.filter(node => findAPIFromNode(node))[0];
}

function getRangeBetweenAPIs(a, b) {
    if(!a || !b || a == b || a.getSelectionGroup() != b.getSelectionGroup()) return [];
    let soundBlockDOMList = [...document.getElementsByClassName('selectable-node-' + a.getSelectionGroup())];
    const aIndex = soundBlockDOMList.indexOf(a.getNode());
    const bIndex = soundBlockDOMList.indexOf(b.getNode());
    const rangeStart = Math.min(aIndex, bIndex);
    const rangeEnd = Math.max(aIndex, bIndex);
    soundBlockDOMList = soundBlockDOMList.slice(rangeStart, rangeEnd + 1);
    return soundBlockDOMList.map(el => findAPIFromNode(el));
}

export function isUnselectable(path) {
    return path.find(node => node.dataset && node.dataset.blockselection);
}

/******* SELECT/DESELECT FUNCTIONS */

export function deselectAll() {
    for (let i = selected.length - 1; i >= 0; i--) {
        deselect(selected[i]);   
    }
}

export function deselectAllOthers(api) {
    for (let i = selected.length - 1; i >= 0; i--) {
        if(selected[i] != api) deselect(selected[i]);   
    }
}

export function deselectAllOutsideGroup(groupName) {
    for (let i = selected.length - 1; i >= 0; i--) {
        if(selected[i].getSelectionGroup() != groupName) deselect(selected[i]);   
    }
}

export function select(api) {
    if(!selected.includes(api)) {
        selected.push(api);
        api.onSelect();
    }
}

export function selectNodes(nodes) {
    const apis = nodes.map(n => findAPIFromNode(n)).filter(api => api);
    apis.forEach(api => {
        select(api);
    });
}

export function deselect(api) {
    if(selected.includes(api)) {
        _.remove(selected, api);
        api.onDeselect();
    }
}

export function isSelected(api) {
    return selected.includes(api);
}

export function toggleSelected(api) {
    if(isSelected(api)) deselect(api);
    else select(api);
}

/******* POINTER EVENTS ******/

export function onLeftClick(e) {
    const api = findAPIFromPath(e.path);

    const multipleSelected = selected.length > 1;

    // Deselect all others if no modifier key pressed (if null deselect all)
    if(!e.ctrlKey && !e.shiftKey) deselectAllOthers(api);
    
    if(!api) { 
        if(!e.shiftKey) lastSelected = null;
        return;
    }

    deselectAllOutsideGroup(api.getSelectionGroup());

    // Deselect on click again
    toggleSelected(api);

    if(multipleSelected && selected.length == 0) select(api);

    if(e.shiftKey && lastSelected) {
        const blockRange = getRangeBetweenAPIs(lastSelected, api);
        blockRange.forEach(_api => select(_api));
    }

    if(isSelected(api)) lastSelected = api;
}

export function onRightClick(e) {
    const api = findAPIFromPath(e.path);
    
    if(!api || (api && !isSelected(api))) {
        deselectAll();
    }

    if(api) {
        select(api);
        lastSelected = api;
    }
}