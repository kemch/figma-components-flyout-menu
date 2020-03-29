<script>
import Menu from "./Menu.svelte";
import {IconButton, Icon, IconCaretRight, IconCaretDown, IconTrash, IconBreak} from 'figma-plugin-ds-svelte';
export let library;
export let index;

let key = library[0].source
let expanded = false;
if (key === 'Local Components') {
    expanded = true;
}

function toggle() {
    expanded = !expanded;

    // const root = document.getElementById('root');
    setTimeout(() => {
        const rect = document.getElementById('root').getClientRects();
        const size = {width: rect[0].width, height: rect[0].height}
        if (size.height < 400) {
            size.height = 400;
        }

        if (size.height > 800) {
            size.height = 800;
        }
    
        // console.log(rect)
        if (expanded) {
            parent.postMessage({pluginMessage: {
                'type':'resize',
                'size': size
            }},'*');
        }
    }, 10);
}
 function remove() {
    parent.postMessage({pluginMessage: {
        'type':'remove', key:key
    }}, '*');
}
</script>
{#if index === 0 && key !== 'Local Components'}
<div class="local__empty">
    No local components
</div>
{/if}
<div on:click={toggle} class="header">
    <div class="header__icon">
        {#if expanded}
            <Icon iconName={IconCaretDown}/>
        {:else}
            <Icon iconName={IconCaretRight}/>
        {/if}
    </div>
    {key}
    {#if key !== 'Local Components'}
    <div class="header__right">
        <IconButton on:click={remove} iconName={IconBreak}/>
    </div>
    {/if}
</div>
{#if expanded}
<div class="menu__wrap">
    <Menu components={library} />
</div>
{/if}

<style>
.menu__wrap {
    position: relative;
}
.header {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    margin-top: -1px;
    font-weight: bold;
    display: flex;
    align-items: center;
    user-select: none;
    cursor: pointer;
}
.header:hover {
    background-color: #f0f0f0;
}
.header__right {
    margin-left: auto;
    padding-right: 16px;
}
.header__icon {
    /* display: inline-block;    */
    vertical-align: middle;
    margin-right: -8px;
}
h3 {
    font-size: 11px;
    
}
.local__empty {
    padding: 10px 20px;
    color: var(--black3);
    user-select: none;
}
</style>