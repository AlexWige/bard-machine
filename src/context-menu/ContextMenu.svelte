<script>
	import globalStyles from '../style/global-styles';
    import { onMount, tick } from "svelte";
    import * as contextMenuManager from './context-menu';
    import { bigBlocks } from '../player-store';
    import SoundControls from "./ContextMenuSoundControls.svelte";
    import soundStore from '../sound-blocks/sound-store';
    import { modal } from "../modal/modal-manager";

	export let x = 0;
	export let y = 0;
    export let visible = false;

    let soundControls;    
    let options = [];
    let apis = [];
    let selectedSoundAPI;
    let currentSourceIndex;
    let currentSourceTitle;

    onMount(async() => {
        contextMenuManager.setContextMenuAPI(api);
    });

    const api = {
        show: show,
        hide: hide
    };
    
    function show(_x, _y, _options, _apis) {
        if(selectedSoundAPI && selectedSoundAPI.getNode()) {
            selectedSoundAPI.getNode().removeEventListener('change-source', onCurrentSoundChangeSource);
        }
        visible = true;
        x = _x;
        y = _y;
        options = _options;
        apis = _apis;
        const selectedSoundAPIs = _apis.map(api => {
            const sound = soundStore.getItemFromNode(api.getNode());
            if(sound) return sound.api;
        }).filter(item => item);

        if(selectedSoundAPIs.length == 1) {
            selectedSoundAPI = selectedSoundAPIs[0];
            currentSourceIndex = selectedSoundAPI.getCurrentSourceIndex();
            currentSourceTitle = selectedSoundAPI.getData().sources[currentSourceIndex].title;
            selectedSoundAPI.getNode().addEventListener('change-source', onCurrentSoundChangeSource);
        } else selectedSoundAPI = null;

        soundControls?.updateSound(selectedSoundAPI);
    }

    function hide() {
        visible = false;
        if(selectedSoundAPI && selectedSoundAPI.getNode()) {
            selectedSoundAPI.getNode().removeEventListener('change-source', onCurrentSoundChangeSource);
        }
    }

    function onClickOption(option) {
        option.onClick.forEach(action => action());
    }

    function onCurrentSoundChangeSource(event) {
        currentSourceIndex = event.detail.index;
        currentSourceTitle = event.detail.source.title;
    }

    $: isPlaylist = (selectedSoundAPI && selectedSoundAPI.getData().sources.length > 1);
    $: totalSources = selectedSoundAPI ? selectedSoundAPI.getData().sources.length : 1;

    $: style = `--bg: ${globalStyles.bg.darken(0.2)};`
        + `--verticalPadding: ${ $bigBlocks ? '8px' : '4px'};`
        + `--font-size: ${ $bigBlocks ? '14px' : '13px'};`;

</script>

{#if visible && options.length > 0}
    <div style="top: {y}px; left: {x}px; {style}" id="context-menu">
        <ul>
            {#if selectedSoundAPI}
                {#if isPlaylist}
                    <li id="playlist-status">
                        <span class="progress-number">{currentSourceIndex + 1}/{totalSources}</span>&nbsp; {currentSourceTitle}
                    </li>
                {/if}
                <li id="context-sound-controls">
                    <SoundControls bind:this={soundControls} soundAPI={selectedSoundAPI}/>
                </li>
            {/if}
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
        z-index: 10000;
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

                &#playlist-status {
                    border: 0;
                    padding-bottom: 0px;
                    cursor: default;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                    padding-right: 10px;
                    
                    &:hover {
                        background-color: inherit;
                    }

                    .progress-number {
                        color: #aaa;
                        font-size: 11px;
                    }
                }

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