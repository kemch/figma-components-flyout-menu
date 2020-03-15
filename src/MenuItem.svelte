<script>

    import Notification from './Notification.svelte';
    import {Icon, IconSpinner} from 'figma-plugin-ds-svelte';

    export let name;
    export let id;
    export let key;
    export let subIndicator;
    let visible = false;
    

    function addComponent(id, key) {
        parent.postMessage({ pluginMessage: { type: 'create-component', component: id } }, '*');        
    }

    function tooltip() {
        console.log(name.length)
        if (name.length > 12) {
            visible = !visible;
        }
    }


   
</script>

{#if visible}
<div class="tooltip">{name}</div>
{/if}
<div class="menu__item__content" data-key={key} on:mouseover={tooltip} on:mouseout={tooltip} on:click={addComponent({id, key})}>{name} {#if subIndicator} <span class="menu__indicator"></span>{/if}</div>



<style>

.menu__item__content {
    background-color: white;
    padding: 4px;

    padding: 8px 16px;
    white-space: nowrap;
    width: 120px;
    position: relative;

    white-space: nowrap;
    text-overflow: ellipsis;

    overflow: hidden;
}

.menu__item__content:hover .menu__item__content {
    border-left-color:black;
}
.menu__item__content:hover {
    background-color: #f0f0f0;
}


.menu__indicator {
    position: absolute;
    top: 12px;
    right: 4px;
    width: 0; 
    height: 0; 
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-left: 4px solid rgba(0, 0,0,0.4);
}
.tooltip {
    background-color: black;
    white-space: nowrap;
    padding: 3px;
    color: white;
    position: absolute;
    top: -25px;
    left: 20px;
    z-index: 1;
}
.tooltip:after {
    content: " ";
    position: absolute;
    bottom: -6px;
    right: 50%;
    margin-left: 3px;
    width: 0; 
    height: 0; 
    border-right: 3px solid transparent;
    border-left: 3px solid transparent;
    border-top: 6px solid black;
}
</style>