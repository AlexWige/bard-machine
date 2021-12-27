<script>
    import { onMount } from "svelte";
    
    export let width;
    export let min = 0;
    export let max = 500;

    let grabZone;
    $: resizableNode = getResizableNode(grabZone);

    function onPointerDown(e) {
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    }

    function onPointerMove(e) {
        const rectStart = resizableNode.getBoundingClientRect().x;
        width = e.clientX - rectStart;
        if(width < min) width = min;
        else if(width > max) width = max;
    }

    function onPointerUp(e) {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
    }

    function getResizableNode(grabZone) {
        if(grabZone) return grabZone.parentElement;
    }
</script>

<div id="resize-grab-zone" bind:this={grabZone} on:pointerdown={onPointerDown}>
    <div class="line"></div>
</div>

<style lang="scss">
    #resize-grab-zone {
        position: absolute;
        right: -6px;
        width: 12px;
        top: 0;
        bottom: 0;
        cursor: col-resize;
        
        .line {
            position: absolute;
            width: 1px;
            top: 0;
            bottom: 0;
            left: 6px;
            background-color: transparent;
            transition: background-color 0.2s;
        }

        &:hover {
            .line {
                background-color: rgba(255, 255, 255, 0.685);
            }
        }
    }
</style>