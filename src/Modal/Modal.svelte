<script>
    import GlobalStyles from "../GlobalStyles";
    import ModalOption from "./ModalOption.svelte";
    import ModalInput from "./ModalInput.svelte";
    import { onMount, onDestroy } from "svelte";
    import { apis } from "../playerStore";

    $: style = `--bgCache: ${GlobalStyles.bg.darken(0.5).fade(0.4)};`
            + `--boxBg: ${GlobalStyles.bg.lighten(0.6)};`
            + `--topBarHeight: ${GlobalStyles.topBarSize};`;

    export let visible = false;
    export let text = "This is a modal";
    export let hasInputField = false;
    export let options = [
        // { 
        //     name: "Close",
        //     onClick: () => hide(),
        //     backgroundColor: '#d03d3d'
        // }
    ];
    export let inputValue = '';
    export let inputPlaceholder = 'Enter your text here...';

    export const api = {
        show: show,
        hide: hide,
        getInputValue: () => inputValue
    };

    onMount(async () => {
        apis.modal = api;
    });

    export function hide() {
        visible = false;
    }

    export function show(_text, _options = null, _hasInputField = false, _inputFieldValue = null, _inputFieldPlaceholder = null) {
        text = _text;
        if(options) options = _options;
        hasInputField = _hasInputField;
        if(_hasInputField) {
            if(_inputFieldValue) inputValue = _inputFieldValue;
            if(_inputFieldPlaceholder) inputPlaceholder = _inputFieldValue;
        }
        visible = true;
    }
</script>


{#if visible}
<div id="modal" style={style}>
    <div class="modal-content">
        <div class="main-text">
            {text}
        </div>
        {#if hasInputField}
            <ModalInput bind:value={inputValue} bind:placeholder={inputPlaceholder}/>
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
{/if}

<style lang="scss">
    #modal {
        display: block;
        background-color: var(--bgCache, #333333cc);
        position: fixed;
        top: var(--topBarHeight, 25px);
        left: 0;
        width: 100%;
        height: 100%;

        .modal-content {
            position: fixed;
            z-index: 1200;
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