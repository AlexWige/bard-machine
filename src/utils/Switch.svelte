<script>
    import Color from 'color';
    export let checked = false;
    export let bgColor = Color("#00000066");
    export let bgColorActive = Color("#ffffff99");
    export let domElement = {};
    
    $: style = `--bgColor: ${checked ? bgColorActive.rgb() : bgColor.rgb()};`;
</script>

<label bind:this={domElement} class="switch" style={style}>
    <input type="checkbox" bind:checked />
    <span class="slider" />
</label>

<style>
    .switch {
        position: relative;
        display: inline-block;
        width: 32px;
        height: 18px;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--bgColor, #bbb);
        -webkit-transition: 0.4s;
        transition: 0.2s;
        border-radius: 34px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 1px;
        bottom: 1px;
        background-color: white;
        transition: 0.2s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: var(--bgColor, #bbb);
    }

    input:checked + .slider {
        box-shadow: 0 0 1px var(--bgColor, #bbb);
    }

    input:checked + .slider:before {
        transform: translateX(14px);
    }
</style>
