<script>
    export let name;
    export let id;
    export let key;
    export let subIndicator;


    function addComponent(id) {
        console.log(`1 ${id}`)
        console.log(`2 ${key}`)
        parent.postMessage({ pluginMessage: { type: 'create-component', component: key } }, '*');
    }

    function resize() {
        // console.log('hi')
        let width, height;
        setTimeout(function(){
            let height = document.getElementById('root').offsetHeight;
            let width = document.getElementById('root').offsetWidth;
            console.log(height);
            console.log(width);
        },500);
    }
</script>

<div class="menu__item__content" data-key={key} on:click={addComponent({id})}>{name} {#if subIndicator} <span class="menu__indicator"></span>{/if}</div>

<style>

.menu__item__content {

}
.menu__item__indicator {
    position: absolute;
    top: 6px;
    right: 5px;
    width: 0; 
    height: 0; 
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-left: 6px solid black;
}
</style>