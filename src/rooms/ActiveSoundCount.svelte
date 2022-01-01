<script>
    import globalStyles from "../style/global-styles";

    export let count = 0;
    export let category = 'music';

    $: active = count > 0;
    $: displayedCount = count < 10 ? count : '9+';

    $: style = `--musicColor: ${globalStyles.music};`
        + `--ambientColor: ${globalStyles.ambient};`
        + `--effectsColor: ${globalStyles.effects};`;
</script>

<div class="sound-count {category}" class:active={active}>{displayedCount}</div>

<style lang="scss">
    .sound-count {
        min-width: 8px;
        padding: 0 2px;
        height: 15px;
        margin: 2px 2px;
        border-radius: 2px;
        font-size: 10px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.5);
        background-color: rgba(255, 255, 255, 0.15);
        text-align: center;

        &.active {
            color: #111;
            font-weight: 600;

            &.music {
                background-color: var(--musicColor);
            }

            &.ambient {
                background-color: var(--ambientColor);
            }

            &.effects {
                background-color: var(--ambientColor);
            }
        }
    }
</style>