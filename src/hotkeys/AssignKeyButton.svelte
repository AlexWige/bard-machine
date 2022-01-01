<script>
    import { onMount, onDestroy } from "svelte";
    import tippy from "tippy.js";    
    import { getInputModal } from "../hotkeys/hotkey-manager";

    let mainNode;
    export let hotkeyName = '';
    export let enabled = true;
    export let small = false;
    export let onKeyAssign = (keyCode, keyName) => {};
    
    $: fontSize = getKeyFontSize(hotkeyName ? hotkeyName.length : 0, small); 

    onMount(async() => { 
        tippy(mainNode, { content:  'Assign hotkey' });
    });

    function getKeyFontSize(keyNameLength, small) {
        if(small) {
            if(keyNameLength <= 1) return '17.5px';
            else if(keyNameLength == 2) return '15.5px';
            else if(keyNameLength == 3) return '13.5px';
            else return '10px';
        } else {
            if(keyNameLength <= 1) return '25px';
            else if(keyNameLength == 2) return '21px';
            else if(keyNameLength == 3) return '18px';
            else return '13px';
        }
    }

    function onButtonPressed(e) {
        if(!enabled) return;
        getInputModal()?.show(onKeyAssign);
    }
</script>


<div bind:this={mainNode} data-blockselection={true} on:click={onButtonPressed}
    class="assign-btn" class:small={small} style="font-size: {fontSize}">
    {hotkeyName}
</div>         

<style lang="scss">
    .assign-btn {
        position: absolute;
        height: 40px;
        width: 40px;
        right: 7px;
        top: 6px;
        box-sizing: border-box;
        border: 3px solid var(--assignButtonBorder, #555);
        border-radius: 5px;
        background-color: transparentize(#000, 0.8);
        color: white;
        text-align: center;
        padding: 5px;
        line-height: 26px;
        font-size: 25px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        justify-content: center;
        overflow: hidden;

        &:hover {
            transform: scale(1.08);
            background-color: transparentize(#000, 0.7);
        }

        &:active {
            transform: scale(0.98);
        }

        &.small {
            width: 24px;
            height: 24px;
            top: 3px;
            right: 4px;
            border-width: 2px;
            border-radius: 3px;
            border-color: transparent;
            font-size: 17.5px;
            padding: 2px;
            line-height: 1em;
        }
    }
</style>