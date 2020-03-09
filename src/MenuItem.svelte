<script>
    export let name;
    export let id;
    export let key;
    export let subIndicator;
    let visible = false;


    function addComponent(id, key) {
        // if (key === '') {
            // console.log(id)
            parent.postMessage({ pluginMessage: { type: 'create-component', component: id } }, '*');
        // } else {
        //     parent.postMessage({ pluginMessage: { type: 'create-component', component: key } }, '*');
        // }
        
    }

    function tooltip() {
        visible = !visible;
    }

    function resize() {
        
        let width, height;
        setTimeout(function(){
            let height = document.getElementById('root').offsetHeight;
            let width = document.getElementById('root').offsetWidth;
            console.log(height);
            console.log(width);
        },500);
    }
   
</script>

{#if visible}
<div class="tooltip">{name}</div>
{/if}
<div class="menu__item__content" data-key={key} on:mouseover={tooltip} on:mouseout={tooltip} on:click={addComponent({id, key})}>{name} {#if subIndicator} <span class="menu__indicator"></span>{/if}</div>

<style>

.menu__item__content {
    /* background-color: #222222; */
    padding: 4px;
    font-size: 12px;

    padding: 8px 16px;
    white-space: nowrap;
    width: 120px;
    position: relative;

    white-space: nowrap;
    text-overflow: ellipsis;

    overflow: hidden;
    /* font-family: 'Inter', 'Roboto'; */
}
.menu__indicator {
    position: absolute;
    top: 12px;
    right: 5px;
    width: 0; 
    height: 0; 
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-left: 6px solid black;
}
.tooltip {
    background-color: black;
    padding: 2px;
    color: white;
    position: absolute;
    top: -35px;
    left: 20px;
}
</style>