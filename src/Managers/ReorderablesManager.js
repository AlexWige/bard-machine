import _ from 'lodash';
import * as selectionManager from "./SelectionManager";

// List of Reorderable APIs
export const reorderables = [];
let currentAPI;
let currentSiblings;

// Drag and drop
let isDragging = false;
let isTopOfHoveredElement = false;

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
}
`;
document.body.appendChild(dropPreviewStyle);

/***** REORDERABLE LIST MANAGEMENT *****/

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

/***** DRAG EVENTS *****/

export function onDragStart(e) {
    currentAPI = findAPIFromNode(e.draggableNode);
    if(!currentAPI) return;

    isDragging = true;
    document.body.classList.toggle('grabbing', true);
    const draggedNode = currentAPI.getNode();
    draggedNode.appendChild(dropPreviewBar);
    currentSiblings = [...draggedNode.parentNode.children];
    currentSiblings = currentSiblings.filter(n => findAPIFromNode(n));
    currentSiblings.forEach(node => {
        node.addEventListener('pointermove', onHoverNodeWhileDragging);
        node.addEventListener('pointerleave', onExitNodeWhileDragging);
    });
    if(currentAPI.onDragStart) currentAPI.onDragStart();
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

export function onDragEnd(e) {
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
    dropPreviewBar.parentNode?.removeChild(dropPreviewBar);
    currentSiblings.forEach(node => {
        node.removeEventListener('pointermove', onHoverNodeWhileDragging);
        node.removeEventListener('pointerleave', onExitNodeWhileDragging);
    });
    currentSiblings = [];
    if(currentAPI.onDragEnd) currentAPI.onDragEnd();
}

/****** UTILITY ******/

function putSelectionAfter(targetAPI) {
    let selectedNodes = selectionManager.selected.map(api => api.getNode());
    selectedNodes = getNodesInDomOrder(selectedNodes);

    for (let i = selectedNodes.length - 1; i >= 0; i--) {
        const api = findAPIFromNode(selectedNodes[i]);
        if(api) api.putAfter(targetAPI.getNode());
    }

    selectionManager.selectNodes(selectedNodes);
}

function putSelectionBefore(targetAPI) {
    let selectedNodes = selectionManager.selected.map(api => api.getNode());
    selectedNodes = getNodesInDomOrder(selectedNodes);

    for (let i = 0; i < selectedNodes.length; i++) {
        const api = findAPIFromNode(selectedNodes[i]);
        if(api) api.putBefore(targetAPI.getNode());
    }

    selectionManager.selectNodes(selectedNodes);
}

function findAPIFromNode(node) {
    return reorderables.find(api => api.getNode() == node);
}

function findReorderableNodeInPath(path) {
    return path.filter(node => findAPIFromNode(node))[0];
}

function getInsideVerticalPosition(node, event) {
    const rect = node.getBoundingClientRect();
    return (event.clientY - rect.top) / (rect.bottom - rect.top);
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

/***** POINTER EVENTS *****/

function onHoverNodeWhileDragging(e) {
    const node = findReorderableNodeInPath(e.path);
    if(dropPreviewBar.parentNode != node) {
        dropPreviewBar.parentNode?.removeChild(dropPreviewBar);
        node.appendChild(dropPreviewBar);
    }
    const elementY = getInsideVerticalPosition(node, e);
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

function onExitNodeWhileDragging(e) {
    const node = findReorderableNodeInPath(e.path);
    if(node && dropPreviewBar.parentNode == node) {
        node.removeChild(dropPreviewBar);
    }
}