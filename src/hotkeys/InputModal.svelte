<script>
    import globalStyles from "../style/globalStyles";
    import { onMount } from "svelte";
    import { inputModalActive, editedSoundID } from "./hotkey-manager";
    import * as hotkeyManager from "./hotkey-manager";

    $: style = `--bgCache: ${globalStyles.bg.darken(0.5).fade(0.1).rgb()};`
        + `--boxBg: ${globalStyles.bg.lighten(0.6).rgb()};`
        + `--displayed: ${$inputModalActive ? 'block' : 'none'};`
        + `--topBarHeight: ${globalStyles.topBarSize};`;

    onMount(async () => {
        hotkeyManager.registerInputModal(api);
    });

    const api = {
        show: show,
        hide: hide
    }
    
    export function show(soundID) {
        editedSoundID.set(soundID);
        inputModalActive.set(true);
    }

    export function hide() {
        inputModalActive.set(false);
    }
    
    function unassignKey() {
        hotkeyManager.setSoundHotkey($editedSoundID, -1, '');
        hide();
    }
</script>

<div id="input-modal" class="prompt" style={style} on:click={hide}>
    <div class="prompt-box">
        <div id="input-modal-touch-zone">
            <h2>Press any key to assign...</h2>
            <div class="key"></div>
        </div>
        <div class="prompt-options">
            <a id="input-modal-delete" on:click={unassignKey}>Unassign</a>
            <a id="input-modal-cancel" on:click={hide}>Go back</a>
        </div>
    </div>
</div>

<style lang="scss">
    .prompt {
        $buttonHeight: 60px;

        display: var(--displayed, none);
        background-color: var(--bgCache, #333333cc);
        position: fixed;
        top: var(--topBarHeight, 25px);
        left: 0;
        width: 100%;
        height: 100%;

        .prompt-box {
            position: fixed;
            z-index: 1200;
            left: 50%;
            top: 40%;
            width: 90%;
            height: 90%;
            max-width: 400px;
            max-height: 250px;
            transform: translate(-50%, -50%);
            background-color: var(--boxBg, #ccc);
            box-shadow: 0 0 20px 1px rgba(0, 0, 0, 0.25);
        }

        #input-modal-touch-zone {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: $buttonHeight;
            padding-top: 40px;
        }

        h2 {
            width: 80%;
            margin: 5px auto 20px auto;
            text-align: center;
            user-select: none;
        }

        .key {
            display: block;
            position: relative;
            margin: 0 auto;
            width: 60px;
            height: 60px;
            background-color:  transparentize(black, 0.85);
            border-radius: 12px;
            text-align: center;
            z-index: -500;

            &::after {
                
                content: '...';
                line-height: 50px;
                color: white;
                font-size: 35px;
                display: block;
                position: absolute;
                right: 5px;
                top: 5px;
                width: 50px;
                height: 50px;
                background-color: transparentize(black, 0.85);
                border-radius: 10px;
                z-index: 500;
            }
        }
        
        .prompt-options {
            position: absolute;
            bottom: 0;
            height: $buttonHeight;
            width: 100%;
            background-color: fade(black, 12%);

            a {
                display: block;
                float: left;
                width: 50%;
                text-align: center;
                padding-top: 20px;
                cursor: pointer;
                transition: 0.2s;
                height: $buttonHeight;
                box-sizing: border-box;
                user-select: none;
                font-size: 15px;
                text-decoration: underline;

                &:nth-of-type(2) {
                    border-left: 1px fade(white, 10%) solid;
                }

                &:active {
                    transition: 0.01s;
                    background-color: fade(white, 15%);
                }
            }
        }
    }
</style>