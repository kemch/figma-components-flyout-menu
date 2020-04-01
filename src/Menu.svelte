<script>
    import MenuItem from './MenuItem.svelte';
    import {GlobalCSS} from 'figma-plugin-ds-svelte';
    export let components;
</script>
<ul class="menu ">
    {#each components as component}
        <li class="menu__item">
            {#if component.components}
                <MenuItem {...component} subIndicator={true}/>
                <svelte:self {...component}/>
            {:else}
                <MenuItem {...component} subIndicator={false}/>
            {/if}
        </li>
    {/each}
</ul>

<style>
:global(*) {
    box-sizing: border-box;
}

:global(body) {
    margin: 0;
    padding: 0;
}
:global(ul, li) {
    margin: 0;
    padding: 0;
}

:global(ul) {
    list-style: none;
    padding-left: 0;
    top: 0;
}

:global(.menu) {
    /* position: absolute; */
    width: 120px;
    /* border:1px solid var(--silver); */

    box-sizing: content-box;
    margin-bottom: 20px;
    /* box-shadow: var(--shadow-hud); */
}

:global(.menu:hover) {
    
}

:global(.menu .menu) {
    position: absolute;
    margin-top: -1px;
}
:global(.menu > .menu__item) {
    position: relative;
    /* margin-top: -1px; */
    cursor: pointer;

}

:global(.menu__item) {
    /* font-size: 12px; */
    /* color: white; */
    background-color: white;
    /* padding: 4px; */
    /* border: 1px solid #ccc; */
}
:global(.menu > .menu__item > .menu) {
    left: 100%;
    visibility: hidden;
    opacity: 0;
    transition: 0s;
    transition-delay: 100ms;
    z-index: -1;
    pointer-events: none;
}
:global(.menu > .menu__item:hover > .menu) {
    visibility: visible;
    opacity: 1;
    z-index: 1;
    pointer-events: auto;
}
</style>