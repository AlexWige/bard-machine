import * as selectionManager from "./SelectionManager";
import * as reorderableManager from "./ReorderablesManager";
import * as contextMenuManager from "./ContextMenuManager";

let isDragging = false;
let dragStartPosition = { x: 0, y: 0};
let dragDelta = { x: 0, y: 0 };
let currentDraggableNode = false;
let isPressed = false;

/***** MOUNT/DISMOUNT MANAGER *****/

export async function onAppMount() {
    window.addEventListener('click', onClick);
    window.addEventListener('contextmenu', onContextClick);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
}

export async function onAppDestroy() {
    window.removeEventListener('click', onClick);
    window.removeEventListener('contextmenu', onContextClick);
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
}

/***** DRAG *****/

function onDragStart(e) {
    reorderableManager.onDragStart({ 
        event: e, 
        startPosition: dragStartPosition, 
        delta: dragDelta, 
        draggableNode: currentDraggableNode 
    });
}

function onDragMove(e) { 
    reorderableManager.onDragMove({ 
        event: e, 
        startPosition: dragStartPosition, 
        delta: dragDelta, 
        draggableNode: currentDraggableNode 
    });
}

function onDragEnd(e) {
    reorderableManager.onDragEnd({ 
        event: e, 
        startPosition: dragStartPosition, 
        delta: dragDelta, 
        draggableNode: currentDraggableNode 
    });
}

function doClick(e) {
    selectionManager.onLeftClick(e);
}

/***** POINTER EVENTS *****/

function onClick(e) {
    if(e.sourceCapabilities.firesTouchEvents) {
        doClick(e);
    }
}

function onContextClick(e) {
    selectionManager.onRightClick(e);
    contextMenuManager.onRightClick(e);
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
            onDragStart(e);
            isDragging = true;
        }
    } else {
        onDragMove(e);
    }
}

function onPointerUp(e) {
    if(e.pointerType == 'mouse' && e.button != 0) return;
    isPressed = false;
    if(isDragging) {
        onDragEnd(e);
        isDragging = false;
    } else {
        if(e.pointerType != 'touch')  {
            doClick(e);
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