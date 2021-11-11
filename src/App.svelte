<script>
    import TopBar from "./TopBar.svelte";
    import SoundBlock from "./SoundBlock.svelte";
    import GlobalColors from "./GlobalColors";

    $: style = `--bg: ${GlobalColors.bg};`
</script>

<main style={style}>
    <TopBar/>
    <br /><br />
    <div style="width: 90%; margin: 15px auto;">
        <SoundBlock blockType="music" title="Titre de la musique"/>
        <SoundBlock blockType="ambient" title="Titre de l'ambiance"/>
        <SoundBlock blockType="sfx" title="Titre de l'effet"/>
    </div>
</main>

<style lang="scss">
    @import './fonts.scss';

    main {
        background-color: var(--bg, #333);
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
    }
</style>
