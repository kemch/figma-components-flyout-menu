<script>
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

export let dragging;
function addEvent(obj, evt, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(evt, fn, false);
    }
    else if (obj.attachEvent) {
        obj.attachEvent("on" + evt, fn);
    }
}

addEvent(document, "mouseout", function(e) {
    e = e ? e : window.event;
    var from = e.relatedTarget || e.toElement;
    if (!from || from.nodeName == "HTML") {
        dragging = false;
        // stop your drag event here
		// for now we can just use an alert
		// dragging = !dragging;
        // alert("left window");
        // console.log(e)
    }
});



let x = 360;
let y = 400;
let inc = 20;

$: screen = dragging === true;

function drag(event) {

    
    dragging = !dragging;
    dispatch('drag', {
        'dragging': dragging
    });

    if (dragging === true) {
        // console.log('DRAGGING IS NOW ACTIVATED')
        
    } else {
        const size = {width: x, height: y}
        parent.postMessage({pluginMessage: {
            'type': 'resize',
            'size': size
        }}, '*');
        
    }
}

function move(event) {
    if (dragging === true) {

        // console.log(event.clientX)

        x = event.clientX + inc;
        y = event.clientY + inc;

        
        if (event.clientX < 200) {
            x = 200 + inc;
        }

        if (event.clientY < 150) {
            y = 150 + inc;
        }
        const size = {width: x, height: y}
        parent.postMessage({pluginMessage: {
            'type': 'resize',
            'size': size
        }}, '*');
    }
}
</script>

<div on:mousedown={drag} class="drag-handle"></div>
{#if (screen)}
	<div class="screen" on:mouseup={drag} on:mousemove={move}></div>
{/if}

<style>

.drag-handle {
	position: fixed;
	bottom: 0;
	right: 0;

	cursor: nwse-resize;
	z-index: 9;

	width: 40px;
	height: 40px;
}

.drag-handle:after {
	position: absolute;
	bottom: 0;
	right: 0;
	content: " ";
	width: 0; 
    height: 0; 
    border-left: 10px solid transparent;
    border-top: 5px solid transparent;
    border-right: 5px solid #E5E5E5;
    border-bottom: 10px solid #E5E5E5;
}

.screen {
	position: fixed;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 10;
	background-color: rgba(0,0,0, 0.1);
}

</style>