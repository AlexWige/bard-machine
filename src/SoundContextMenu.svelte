<script>
	import GlobalStyles from './GlobalStyles';
    import { apis } from "./playerStore";
    import { onMount, onDestroy } from "svelte";
    import soundStore from './soundStore';
    import fileLoader from "./fileLoader";

	export let x = 0;
	export let y = 0;
    export let visible = false;
    
    let domElement;
    let selectedSoundsOnShow;

    $: selectedSoundsNumber = selectedSoundsOnShow ? selectedSoundsOnShow.length : 0;
    $: plural = selectedSoundsOnShow?.length > 1;

    onMount(async() => {
        apis.contextMenu = {
            show: show,
            hide: hide
        }
    });
    
    function show(_x, _y) { 
        x = _x;
        y = _y;
        visible = true;
        selectedSoundsOnShow = soundStore.getSelectedItems();
    }

    function hide() {
        visible = false;
    }

    function removeSelectedSounds() {
        let selectedSounds = soundStore.getSelectedItems();
        for (let i = selectedSounds.length - 1; i >= 0; i--) {
            soundStore.removeSound(selectedSounds[i].id);
        }
        fileLoader.saveCollection();
    }

    function stopSelectedSounds() {
        let selectedSounds = soundStore.getSelectedItems();
        selectedSounds.forEach(sound => {
            sound.api.stop();
        });
    }

    $: style = `--bg: ${GlobalStyles.bg.darken(0.2)};`;

</script>

{#if visible && selectedSoundsNumber > 0}
    <div bind:this={domElement} style="top: {y}px; left: {x}px; {style}">
        <ul>
            <li on:click={stopSelectedSounds}>Stop</li>
            <li on:click={removeSelectedSounds}>Remove Sound{#if plural}s{/if}</li>
        </ul>
    </div>
{/if}


<style lang='scss'>
	div {
		display: block;
        position: fixed;
        width: 230px;
        min-height: 20px;
		border: 1px solid #0003;
		box-shadow: 1px 1px 5px 0px #0002;
		background: var(--bg, #333);
        z-index: 1000;
        font-size: 13px;

        ul {
            display: block;
            margin: 0;
            padding: 0;
            text-indent: 0;
            list-style: none;

            li {
                display: block;
                padding: 3px;
                border-bottom: 1px rgba(white, 0.2) solid;
                cursor: pointer;

                &:hover {
                    background-color: rgba(black, 0.2);
                }

                &:last-of-type {
                    border-bottom: none;
                }
            }
        }
	}
</style>