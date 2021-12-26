<script>
    import SoundBlock from './sound-blocks/SoundBlock.svelte';
    import soundStore from './sound-blocks/sound-store';
    import _ from 'lodash';
    import AddSoundButton from './AddSoundButton.svelte';
    import collectionLoader from "./collection-loader";

    export let category;

    function onSoundPathAdded(paths) {
        collectionLoader.addSounds(paths, category);
        collectionLoader.saveCollection();
    }
</script>

<div class="category {category}">
    <h2><i class="icon-font {category}-icon"></i>{_.upperFirst(category)}</h2>
    <div class="sound-box-container">
        {#each $soundStore.filter(s => s.data.category == category) as item (item.id)}
            <SoundBlock bind:soundData={item.data} bind:id={item.id}/>
        {/each}
        {#if $soundStore.filter(s => s.data.category == category).length == 0}
            <div class="empty-sound">No sound found in this category.</div>
        {/if}
        <AddSoundButton onSoundPathAdded={onSoundPathAdded}/>
    </div>
</div>

<style lang="scss">
    .category {
        float: left;
        box-sizing: border-box;
        padding: 15px;
        padding-bottom: 40px;

        .empty-sound {
            width: 80%;
            margin: 20px auto 0 auto;
            max-width: 250px;
            background-color: rgba(0, 0, 0, 0.1);
            color: #ddd;
            font-size: 13px;
            border-radius: 4px;
            padding: 5px;
            text-align: center;
        }

        h2 {
            width: 100%;
            margin-top: 10px;
            margin-bottom: 20px;
            text-align: center;
            user-select: none;
            font-size: 22px;

            .icon-font::before {
                font-family: 'icomoon';
                font-style: normal;
                display: inline-block;
                margin-right: 12px;
                font-size: 26px;
                transform: translateY(3px);
            }

            .music-icon::before {
                content: '\e901';
                color: var(--musicColor, #fff);
            }

            .ambient-icon::before {
                content: '\e900';
                color: var(--ambientColor, #fff);
            }

            .effects-icon::before {
                content: '\e902';
                color: var(--effectsColor, #fff);
            }
        }
    }
</style>