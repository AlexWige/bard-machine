//* Handles pointer events (click, contextmenu, drag) and calls other managers
/*  ---
    Draggable nodes:
    - Use attribute 'data-draggable' (dataset) on nodes to set them as draggable
    - Attribute 'data-blockdrag' can be used to cancel this drag effect on child nodes
*/
import * as selectionManager from "./selection";
import * as reorderableManager from "./reorderables";
import * as contextMenuManager from "./contextMenu"

let isDragging = false;
let dragStartPosition = { x: 0, y: 0};
let dragDelta = { x: 0, y: 0 };
let currentDraggableNode = false;
let isPressed = false;

/**************** EVENTS SETUP ****************/

export async function onAppMount() {
    window.addEventListener('click', onClickEvent);
    window.addEventListener('contextmenu', onContextClickEvent);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
}

export async function onAppDestroy() {
    window.removeEventListener('click', onClickEvent);
    window.removeEventListener('contextmenu', onContextClickEvent);
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
}

/***************** CALLBACKS ******************/

// Triggered on normal click/touch
function click(e) {
    selectionManager.onLeftClick(e);
}

// Triggered on right click/touch hold
function contextMenu(e) {
    selectionManager.onRightClick(e);
    contextMenuManager.onRightClick(e);
}

// Triggered after holding and moving draggable node out of 'deadzone'
function dragStart(e) {
    reorderableManager.onDragStart({ 
        event: e, 
        startPosition: dragStartPosition, 
        delta: dragDelta, 
        draggableNode: currentDraggableNode 
    });
}

// Triggered on moving draggable node
function dragMove(e) { 
    reorderableManager.onDragMove({ 
        event: e, 
        startPosition: dragStartPosition, 
        delta: dragDelta, 
        draggableNode: currentDraggableNode 
    });
}

// Triggered on releasing draggable node
function dragEnd(e) {
    reorderableManager.onDragEnd({ 
        event: e, 
        startPosition: dragStartPosition, 
        delta: dragDelta, 
        draggableNode: currentDraggableNode 
    });
}


/***************** EVENT LISTENERS ******************/

// Only used for touch (context click event will cancel this one on hold)
function onClickEvent(e) {
    if(e.sourceCapabilities.firesTouchEvents) {
        click(e);
    }
}

// Right click or hold touch for a couple of seconds
function onContextClickEvent(e) {
    contextMenu(e);
}

function onPointerDown(e) {
    if(e.pointerType == 'mouse' && e.button != 0) return;
    contextMenuManager.onLeftClick(e);
    isPressed = true;
    dragStartPosition = getXAndY(e);
    currentDraggableNode = getDraggableNodeFromPath(e.path);
}

function onPointerMove(e) {
    if(!isPressed) return;
    dragDelta.x = getXAndY(e).x - dragStartPosition.x;
    dragDelta.y = getXAndY(e).y - dragStartPosition.y;
    if(!currentDraggableNode) return;

    const deadZone = e.pointerType == 'mouse' ? 5 : 15;

    if(!isDragging) {
        if((Math.abs(dragDelta.x) + Math.abs(dragDelta.y)) > deadZone) {
            dragStart(e);
            isDragging = true;
        }
    } else {
        dragMove(e);
    }
}

function onPointerUp(e) {
    if(e.pointerType == 'mouse' && e.button != 0) return;
    isPressed = false;
    if(isDragging) {
        dragEnd(e);
        isDragging = false;
    } else {
        // Only used for click with mouse
        if(e.pointerType != 'touch')  {
            click(e);
        }
    }
}

/******* UTILITY *******/

function getDraggableNodeFromPath(path) {
    if(path.find(node => node.dataset && node.dataset.blockdrag)) return;
    return path.find(node => node.dataset && node.dataset.draggable);
}

function getXAndY(e) {
    if(e.touches && e.touches.length > 0)
        return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    else
        return { x: e.clientX, y: e.clientY }
}