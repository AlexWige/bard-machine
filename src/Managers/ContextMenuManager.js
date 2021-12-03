//* Handles context menus
/*  ---
    Object with context menu must register an api with the following keys:
        getNode: () => Return main dom element
        getOptions () => [] Gets array of context menu options for this element
            *OPTIONS are defined like so:
            {   
                Unique id of option
                *id: 'remove-sound-block',
                (Optional) Text displayed in context menu item when only one element on this kind has been right-clicked. 
                Leave this undefined if you don't want the option to appear with only one element
                *solo: 'Remove sound',
                (Optional) Text displayed in context menu item with multiple selected elements on this kind
                Leave this undefined if you don't want the option to appear with multiple elements
                *multiple: 'Remove all selected sounds',
                (Optional) Action done on each selected element with this context menu option when clicked
                *onClickEach: () => { removeSound(); },
                (Optional) Action done only once (even with multiple selected) before other events are called
                *onClickAll: () => { beforeRemovingAll(); },
                (Optional) Set this to true to save sound collection after all actions have been called
                *saveAfter: true
            }
*/
import _ from "lodash";
import * as selectionManager from "./selectionManager";
import collectionLoader from "../collectionLoader";

// Context menu svelte element
let contextMenuAPI;
// List of clickable elements apis
export let clickables = [];
// Last collection of clickable apis
let lastClickablesSelection = [];

/************** LIST MANAGEMENT *************/

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

/************* UTILITY *************/

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

/*  Returns final array of options to display to menu (based on selection)
    Each displayed option contains:
        name: Displayed name (solo or multiple, depending on selection
        onClick: Array of all callbacks on click (click all, each, save, etc)
*/
function getOptionsFor(apis) {
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
        if(option.saveAfter) option.onClick.push(() => collectionLoader.saveCollection());
    });

    // Prune options to remove and return without id or 'toremove'
    return displayedOptions.filter(o => !o.toRemove).map(o => {
        return {
            name: o.name,
            onClick: o.onClick
        }
    });
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