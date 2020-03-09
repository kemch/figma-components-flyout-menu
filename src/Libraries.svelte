<script>
import Menu from "./Menu.svelte";
export let library;
export let index;

let key = library[0].source
let expanded = true;
if (key === 'Local Components') {
    expanded = true;
}

function toggle() {
    expanded = !expanded;
}
 function remove() {
    parent.postMessage({pluginMessage: {
        'type':'remove', key:key
    }}, '*');
}
</script>
{#if index === 0 && key !== 'Local Components'}
No local components
{/if}
<h3>{key}</h3>
<button on:click={toggle}>Toggle</button>
<button on:click={remove}>Remove</button>
{#if expanded}
<div class="menu__wrap">
    <Menu components={library} />
</div>
{/if}

<style>
.menu__wrap {
    position: relative;
}
</style>