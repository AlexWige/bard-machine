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
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
}

export async function onAppDestroy() {
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
}


/***** CLICK ****/

function click(e) {
    selectionManager.onLeftClick(e);
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

// function onDragMove(e) { }

function onDragEnd(e) {
    reorderableManager.onDragEnd({ 
        event: e, 
        startPosition: dragStartPosition, 
        delta: dragDelta, 
        draggableNode: currentDraggableNode 
    });
}

/***** POINTER EVENTS *****/

function onPointerDown(e) {
    if(e.pointerType == 'mouse' && e.button != 0) return;
    contextMenuManager.onLeftClick(e);
    isPressed = true;
    dragStartPosition = { x: e.clientX, y: e.clientY };
    currentDraggableNode = getDraggableNodeFromPath(e.path);
}

function onPointerMove(e) {
    if(!isPressed) return;
    dragDelta.x = e.clientX - dragStartPosition.x;
    dragDelta.y = e.clientY - dragStartPosition.y;

    if(!currentDraggableNode) return;

    if(!isDragging) {
        if((Math.abs(dragDelta.x) + Math.abs(dragDelta.y)) > 5) {
            onDragStart(e);
            isDragging = true;
        }
    } else {
        // onDragMove(e);
    }
}

function onPointerUp(e) {
    if(e.pointerType == 'mouse' && e.button == 2) {
        selectionManager.onRightClick(e);
        contextMenuManager.onRightClick(e);
    }

    if(e.pointerType == 'mouse' && e.button != 0) return;
    isPressed = false;
    if(isDragging) {
        onDragEnd(e);
        isDragging = false;
    } else {
        click(e);
    }
}

function getDraggableNodeFromPath(path) {
    if(path.find(node => node.dataset && node.dataset.blockdrag)) return;
    return path.find(node => node.dataset && node.dataset.draggable);
}