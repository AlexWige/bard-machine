<script>
    import globalStyles from "../style/global-styles";
    import ModalOption from "./ModalOption.svelte";
    import ModalInput from "./ModalInput.svelte";
    import { tick, onMount, onDestroy } from "svelte";
    import { modal, registerModalAPI } from "./modal-manager";
    import * as hotkeyManager from "../hotkeys/hotkey-manager";

    $: style = `--bgCache: ${globalStyles.bg.darken(0.5).fade(0.4)};`
            + `--boxBg: ${globalStyles.bg.lighten(0.6)};`
            + `--topBarHeight: ${globalStyles.topBarSize};`
            + `--display: ${visible ? 'block' : 'none'};`;

    export let visible = false;
    export let text = "This is a modal";
    export let hasInputField = false;
    export let options = [
        // { 
        //     name: "Close",
        //     onClick: () => hide(),
        //     backgroundColor: '#d03d3d',
        //     hotKey: 'Enter'
        // },
    ];
    export let inputValue = '';
    export let inputPlaceholder = 'Enter your text here...';
    let inputField;

    export const api = {
        show: show,
        hide: hide,
        getInputValue: () => inputValue,
        isVisible: () => visible
    };

    onMount(async () => {
        registerModalAPI(api);
    });

    export function hide() {
        visible = false;
        hotkeyManager.removeKeyEventCatcher(catchKeyEvent);
    }

    export function show(_text, _options = null, _inputField = null) {
        visible = true;
        hotkeyManager.addKeyEventCatcher(catchKeyEvent);
        text = _text;
        if(options) options = _options;
        hasInputField = (_inputField != null);
        if(hasInputField) {
            if(_inputField.value) inputValue = _inputField.value;
            if(_inputField.placeholder) inputPlaceholder = _inputField.placeHolder;
            (async () => {
                await tick();
                inputField.focus();
            })();
        }
    }

    function catchKeyEvent(e) {
        return false;
    }
</script>

<div id="modal" style={style}>
    <div class="modal-content">
        <div class="main-text">
            {text}
        </div>
        {#if hasInputField}
            <ModalInput bind:this={inputField} bind:value={inputValue} bind:placeholder={inputPlaceholder}/>
        {/if}
        <ul class="options">
            {#if !options || options.length == 0}
                <ModalOption name="OK" onClick={hide}/>
            {:else}
                {#each options as option, i}
                    <ModalOption {...option}/>
                {/each}
            {/if}
        </ul>
    </div>
</div>

<style lang="scss">
    #modal {
        display: var(--display, none);
        background-color: var(--bgCache, #333333cc);
        position: fixed;
        top: var(--topBarHeight, 25px);
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1200;

        .modal-content {
            position: fixed;
            z-index: 1201;
            left: 50%;
            top: 42%;
            transform: translate(-50%, -50%);
            width: 80%;
            max-width: 500px;
            background-color: var(--boxBg, #ccc);
            box-shadow: 0 0 20px 1px rgba(0, 0, 0, 0.25);
            overflow: hidden;
            box-sizing: border-box;

            .main-text {
                width: 100%;
                padding: 20px;
                box-sizing: border-box;
                text-align: center;
                margin: auto;
                font-size: 17px;
            }

            ul.options {
                display: flex;
                flex-direction: row;
                list-style: none;
                text-indent: 0;
                padding: 0;
                margin: 0;
                margin-top: 8px;
            }
        }
    }
</style>