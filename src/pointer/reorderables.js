//* Handles reorderable element
/*  ---
    Only nodes in the same parent can be reodered
    - Reorderable nodes must be marked as draggable ('data-draggable' attribute to true)
    - Reorderable nodes must be selectables
    - Position must be set to 'relative'
    - Reorderable elements must register an 'api' object with the following methods:
        getNode: () => {}, // Returns main dom element
        putBefore: node => {}, // Move this element before other node
        putAfter: node => {} // Move this element after other node
        onDragStart: dragEvent => {} // (optional)
        onDragEnd: dragEvent => {} // (optional)
*/
import _ from 'lodash';
import * as selectionManager from "./selection";

// List of Reorderable APIs
export const reorderables = [];
// Curent dragged node api
let currentAPI;
// Curent siblings of dragged node (nodes with same parent)
let currentSiblings;

// Drag and drop
let isDragging = false;
let isTopOfHoveredElement = false;

// Drop preview bar, showing after/before nodes while dragging over them
const dropPreviewBar = document.createElement("div");
dropPreviewBar.classList.add('drop-preview-bar');
const dropPreviewStyle = document.createElement('style');
dropPreviewStyle.innerHTML = `
    .drop-preview-bar {
        display: block;
        position: absolute;
        left: -5px;
        right: -5px;
        height: 0px;
        border-bottom: 2px #ffdf2b solid;
    }`;
document.body.appendChild(dropPreviewStyle);

/*********** REORDERABLE LIST MANAGEMENT ***********/

export function register(api) {
    if(!reorderables.includes(api)) {
        api.getNode().dataset.draggable = true;
        reorderables.push(api);
    }
}

export function unregister(api) {
    if(reorderables.includes(api)) {
        api.getNode().dataset.draggable = false;
        _.remove(reorderables, api);
    }
}

/**************** DRAG EVENTS **************/

export function onDragStart(dragEvent) {
    currentAPI = findAPIFromNode(dragEvent.draggableNode);
    if(!currentAPI) return;
    const draggedNode = currentAPI.getNode();
    if(!draggedNode) return;

    isDragging = true;
    document.body.classList.toggle('grabbing', true);
    draggedNode.appendChild(dropPreviewBar);
    currentSiblings = [...draggedNode.parentNode.children];
    currentSiblings = currentSiblings.filter(n => findAPIFromNode(n));
    if(currentAPI.onDragStart) currentAPI.onDragStart(dragEvent);

    // If node is selectable
    const selectable = selectionManager.findAPIFromNode(draggedNode);
    if(selectable) {
        // Select if unselected
        if(!selectionManager.isSelected(selectable)) {
            selectionManager.deselectAll();
            selectionManager.select(selectable);
        }
        // Deselect all outside container
        for (let i = selectionManager.selected.length - 1; i >= 0; i--) {
            const api = selectionManager.selected[i];
            if(api.getNode().parentNode != draggedNode.parentNode) {
                selectionManager.deselect(api);
            }
        }
    }
}

export function onDragMove(dragEvent) {
    if(currentSiblings?.length <= 0) return;

    const hoveredNode = document.elementFromPoint(dragEvent.event.clientX, dragEvent.event.clientY);
    const siblingNode = currentSiblings.find(sibling => sibling == hoveredNode || sibling.contains(hoveredNode));

    if(!siblingNode) {
        dropPreviewBar.parentNode?.removeChild(dropPreviewBar);
        return;
    }
    
    if(dropPreviewBar.parentNode != siblingNode) {
        dropPreviewBar.parentNode?.removeChild(dropPreviewBar);
        siblingNode.appendChild(dropPreviewBar);
    }
    const elementY = getInsideVerticalPosition(siblingNode, dragEvent.event);
    if(elementY > 0.5) {
        isTopOfHoveredElement = false;
        dropPreviewBar.style.top = 'auto';
        dropPreviewBar.style.bottom = '-1px';
    } else {
        isTopOfHoveredElement = true;
        dropPreviewBar.style.bottom = 'auto';
        dropPreviewBar.style.top = '-1px';
    }
}

export function onDragEnd(dragEvent) {
    document.body.classList.toggle('grabbing', false);
    if(!isDragging) return;
    isDragging = false;

    if(dropPreviewBar.parentNode && dropPreviewBar.parentNode != currentAPI.getNode()) {
        const targetNodeAPI = findAPIFromNode(dropPreviewBar.parentNode);
        if(targetNodeAPI) {
            if(isTopOfHoveredElement) putSelectionBefore(targetNodeAPI);
            else putSelectionAfter(targetNodeAPI);
        }
    }
    currentSiblings = [];
    if(currentAPI.onDragEnd) currentAPI.onDragEnd(dragEvent);
    dropPreviewBar.parentNode?.removeChild(dropPreviewBar);
}

/********************* UTILITY *********************/

function putSelectionBefore(targetAPI) {
    let selectedNodes = selectionManager.selected.map(api => api.getNode());
    selectedNodes = getNodesInDomOrder(selectedNodes);

    for (let i = 0; i < selectedNodes.length; i++) {
        const api = findAPIFromNode(selectedNodes[i]);
        if(api) api.putBefore(targetAPI.getNode());
    }

    selectionManager.selectNodes(selectedNodes);
}

function putSelectionAfter(targetAPI) {
    let selectedNodes = selectionManager.selected.map(api => api.getNode());
    selectedNodes = getNodesInDomOrder(selectedNodes);

    for (let i = selectedNodes.length - 1; i >= 0; i--) {
        const api = findAPIFromNode(selectedNodes[i]);
        if(api) api.putAfter(targetAPI.getNode());
    }

    selectionManager.selectNodes(selectedNodes);
}

function findAPIFromNode(node) {
    return reorderables.find(api => api.getNode() == node);
}

// Get global pointer position x and y from event
function getXAndY(e) {
    if(e.touches && e.touches.length > 0)
        return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    else
        return { x: e.clientX, y: e.clientY }
}

function getInsideVerticalPosition(node, event) {
    const rect = node.getBoundingClientRect();
    return (getXAndY(event).y - rect.top) / (rect.bottom - rect.top);
}

export function moveArrayItemAfter(arr, item, target) {
    _.remove(arr, item);
    const targetIndex = arr.indexOf(target);
    arr.splice(targetIndex + 1, 0, item);
    return arr;
};

export function moveArrayItemBefore(arr, item, target) {
    _.remove(arr, item);
    const targetIndex = arr.indexOf(target);
    arr.splice(targetIndex, 0, item);
    return arr;
};

function getNodesInDomOrder(nodes) {
    let siblings = [...nodes[0].parentNode.children];
    return siblings.filter(node => nodes.includes(node));
}