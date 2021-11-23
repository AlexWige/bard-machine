<script>
    export let name = "Option";
    export let onClick = () => console.log("Clicked " + name);
    export let backgroundColor = undefined;

    $: style = `--bgColor: ${backgroundColor ? backgroundColor : 'rgba(255, 255, 255, 0.1)'}`;
</script>

<li on:click="{onClick}" style="{style}">{name}</li>

<style lang="scss">
    li {
        position: relative;
        flex: 1;
        box-sizing: border-box;
        padding: 12px;
        text-align: center;
        cursor: pointer;
        background-color: var(--bgColor, rgba(white, 0.1));
        border-right: 1px rgba(black, 0.2) solid;
        font-size: 15px;

        &:last-of-type {
            border-right: none;
        }

        &:hover::before {
            pointer-events: none;
            display: block;
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(white, 0.2);
        }
    }
</style>