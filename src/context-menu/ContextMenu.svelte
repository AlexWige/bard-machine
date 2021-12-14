<script>
	import globalStyles from '../style/global-styles';
    import { onMount } from "svelte";
    import * as contextMenuManager from '../pointer/context-menu';
    import { bigBlocks } from '../player-store';
    import SoundControls from "./ContextMenuSoundControls.svelte";

	export let x = 0;
	export let y = 0;
    export let visible = false;
    
    let options = [];

    onMount(async() => {
        contextMenuManager.setContextMenuAPI(api);
    });

    const api = {
        show: show,
        hide: hide
    };
    
    function show(_x, _y, _options) {
        visible = true;
        x = _x;
        y = _y;
        options = _options;
    }

    function hide() {
        visible = false;
    }

    function onClickOption(option) {
        option.onClick.forEach(action => action());
    }

    $: style = `--bg: ${globalStyles.bg.darken(0.2)};`
        + `--verticalPadding: ${ $bigBlocks ? '8px' : '4px'};`
        + `--font-size: ${ $bigBlocks ? '14px' : '13px'};`;

</script>

{#if visible && options.length > 0}
    <div style="top: {y}px; left: {x}px; {style}" id="context-menu">
        <ul>
            <!-- <li id="context-sound-controls">
                <SoundControls/>
            </li> -->
            {#each options as option, i}
                <li on:click={() => { onClickOption(option) }}>{@html option.name}</li>
            {/each}
        </ul>
    </div>
{/if}


<style lang='scss'>
	div#context-menu {
		display: block;
        position: fixed;
        width: 230px;
        min-height: 20px;
		border: 1px solid #0003;
		box-shadow: 1px 1px 5px 0px #0002;
		background: var(--bg, #333);
        z-index: 1000;
        font-size: var(--font-size, 13px);

        ul {
            display: block;
            margin: 0;
            padding: 0;
            text-indent: 0;
            list-style: none;

            li {
                position: relative;
                display: block;
                padding: var(--verticalPadding, 4px) 10px;
                border-bottom: 1px rgba(white, 0.2) solid;
                cursor: pointer;

                &:hover {
                    background-color: rgba(black, 0.2);
                }

                &:last-of-type {
                    border-bottom: none;
                }

                &#context-sound-controls {
                    cursor: default;
                    
                    &:hover {
                        background-color: inherit;
                    }
                }
            }
        }
	}
</style>