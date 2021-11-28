<script>
    export let name = "Modal Input";
    export let placeholder = "Enter your text here...";
    export let value = '';

    let inputField;

    export function focus() {
        inputField.focus();
        inputField.select();
    }
</script>

<div class="input-zone">
    <input bind:this={inputField} type="text" bind:value={value} name="{name}" placeholder={placeholder}>
</div>

<style lang="scss">
    .input-zone {
        padding: 5px 25px 12px 25px;

        input {
            text-align: center;
        }
    }
</style>