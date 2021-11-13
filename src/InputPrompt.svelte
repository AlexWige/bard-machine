<script>
    import GlobalColors from "./GlobalColors";
    import SoundBlock from "./SoundBlock.svelte";
    import { hotKeys, isPromptActive } from "./hotkeyStore";
    import { onDestroy, onMount } from "svelte";

    $: isActive = $isPromptActive;
    let currentKeyAPI;

    $: style = `--bgCache: ${GlobalColors.bg.darken(0.5).fade(0.1).rgb()};`
        + `--boxBg: ${GlobalColors.bg.lighten(0.6).rgb()};`
        + `--displayed: ${isActive ? 'block' : 'none'};`;

    onMount(async () => {
        window.addEventListener('keydown', onKeyDown);
    });

    onDestroy(async () => {
        window.removeEventListener('keydown', onKeyDown);
    });
    
    export function show(keyAPI) {
        currentKeyAPI = keyAPI;
        isActive = true;
    }

    export function hide() {
        isActive = false;
    }

    function processKeyName(code, name) {
        switch (code) {
            case  8: return "←"; 
            case 13: return "↵"; 
            case 32: return "␣"; 
            case 37: return "←"; 
            case 38: return "↑"; 
            case 39: return "→"; 
            case 40: return "↓"; 
            default: return name.toUpperCase();
        }
        
    }

    function onKeyDown(e) {
        e.preventDefault();
        let keyName = processKeyName(e.keyCode, e.key);

        if(isActive) {
            if(e.keyCode == 27) {
                hide();
                return;
            }
            if(e.keyCode == 144) return;
            hotKeys.addHotKey(e.keyCode, keyName, currentKeyAPI);
            hide();
        } else {
            const api = hotKeys.findAPI(e.keyCode);
            if(api) api.triggerSound();
        }
    }
    
    function unassignKey() {
        if(currentKeyAPI) {
            hotKeys.removeHotKey(currentKeyAPI.getKeyCode());
        }
        hide();
    }
</script>

<div id="input-prompt" class="prompt" style={style}>
    <div class="prompt-box">
        <div id="input-prompt-touch-zone">
            <h2>Press any key to assign...</h2>
            <div class="key"></div>
        </div>
        <div class="prompt-options">
            <a id="input-prompt-delete" on:pointerdown={unassignKey}>Unassign</a>
            <a id="input-prompt-cancel" on:pointerdown={hide}>Go back</a>
        </div>
    </div>
</div>

<style lang="scss">
    .prompt {
        $buttonHeight: 60px;

        display: var(--displayed, none);
        background-color: var(--bgCache, #333333cc);
        position: fixed;
        top: 24px;
        left: 0;
        width: 100%;
        height: 100%;

        .prompt-box {
            position: fixed;
            z-index: 1200;
            left: 50%;
            margin-left: -200px;
            top: 50px;
            height: 300px;
            width: 400px;
            background-color: var(--boxBg, #ccc);
            box-shadow: 0 0 20px 1px rgba(0, 0, 0, 0.25);
        }

        &.active {
            display: block;
        }

        #input-prompt-touch-zone {
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

        img {
            display: block;
            margin: 30px auto 10px auto;
            opacity: 0.9;
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
                border-radius: 12px;
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