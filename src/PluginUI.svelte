<script>
	
	import Libraries from "./Libraries.svelte";
	import { GlobalCSS } from 'figma-plugin-ds-svelte';
	import { Button, Input, SelectMenu, IconButton, IconCheck, Icon, IconPlus, IconLibrary, IconSwap } from 'figma-plugin-ds-svelte';
	import Notification from './Notification.svelte';

	// let components = [];
	let libs = [];

	// $: console.log(libs);

	$ : notification = 'hide';

	onmessage = async (event) => {

		// LOCAL COMPONENTS
		if (event.data.pluginMessage.components) {
			// console.log('local')
			let data = event.data.pluginMessage.components;
			// no components
			
			if (data.length === 0) {
				return
			} else {
				buildComponents(data, "Local Components");
			}
		}

		// TEAM COMPONENTS FROM CLIENTSTORAGE
		if (event.data.pluginMessage.libs) {
			let data = event.data.pluginMessage.libs;
			let keys = Object.keys(data);

			for (let i = 0; i < keys.length; i++) {
				// console.log(data[keys[i]])
				// libs.push(libdata[libKeys[i]]);
				// libName.push(libKeys[i]);
				buildComponents(data[keys[i]], keys[i]);
			}	
		}

		if (event.data.pluginMessage.notify) {
			console.log(event.data.pluginMessage.notify)
			notification = event.data.pluginMessage.notify;
		}
		
		// console.log("something happened!")
	}
	
	 function splitPath(obj, ckeyPath, value, key) {
		// console.log(key)
		// console.log(value)
		for (let i = 0; i < ckeyPath.length; i++) {
			let ckey = ckeyPath[i].trim(); // name

			if (!(ckey in obj)) {
				obj[ckey] = {};
				obj[ckey].id = value;
				// obj[ckey].id = value;
				// console.log(obj[ckey])
				// console.log(obj)

				// console.log(key)
				obj[ckey].key = key;
			}
			if (typeof obj.id === 'undefined') {
				obj.id = value;
				obj.key = key;
			}
			obj = obj[ckey];
		}
	}

	function discoverChildren(item) {
		if (typeof item[1] === 'object') {
			return item;
		} 
	}
	function transform(object) {
		return Object
			.entries(object)
			.filter(discoverChildren)
			.map(([name, component]) => {
				if (component && typeof component === 'object') {
					if (Object.keys(component).length > 2) {
						return Object.assign({ name }, { key: component.key, id: component.id, components: transform(component) })
					} else {
						return Object.assign({ name }, { key: component.key, id: component.id })
					}      
				} 
			}
		);
	}

	

	function buildComponents(data, key) {

		let map = {};
		for (let i = 0; i < data.length; i++) {
			let split = data[i].name.split('/');
			splitPath(map, split, data[i].id, data[i].key);
		}

		let components = transform(map);
		components[0].source = key; // eh
		console.log(components)
		libs = [...libs, components];
	}

	function storeComponents() {
		parent.postMessage({pluginMessage: {
			'type':'store'
		}},'*');
	}
	function loadComponents() {
		parent.postMessage({pluginMessage: {
			'type':'load'
		}}, '*');
	}
	function removeComponents() {
		parent.postMessage({pluginMessage: {
			'type':'remove'
		}}, '*');
	}
	function add() {
		parent.postMessage({pluginMessage: {
			'type':'add'
		}}, '*');
	}
	function check() {
		parent.postMessage({pluginMessage: {
			'type':'check'
		}}, '*');
	}
	function remove() {
		parent.postMessage({pluginMessage: {
			'type':'remove'
		}}, '*');
	}
	function load() {
		parent.postMessage({pluginMessage: {
			'type':'load'
		}}, '*');
	}
	function refresh() {
		parent.postMessage({pluginMessage: {
			'type': 'refresh'
		}}, '*');
	}
 
	let dragging = false;
	$: screen = dragging === true;
	function drag(event) {

		console.log(event);
		dragging = !dragging;
		if (dragging === true) {
			
		} else {
			console.log('stop')
		console.log(posX)
		console.log(posY)
		const size = {width: posX, height: posY}
		parent.postMessage({pluginMessage: {
			'type': 'resize',
			'size': size
		}}, '*');
			
		}
	}

	let posX = 360;
	let posY = 400;
	let inc = 20;

	function move(event) {
		if (dragging === true) {

			posX = event.clientX + inc;
			posY = event.clientY + inc;

			const size = {width: posX, height: posY}

			if (posX < 240) {
				posX = 240;
			}

			if (posY < 200) {
				poxY = 200;
			}

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
<Notification visible={notification}/>
<div id="root" class={screen? 'lock':'unlock'}>
	<div class="header">
		<div class="header__left">
			<div class="button"><IconButton title="Add current document library" iconName={IconPlus} on:click={add} /></div>
		<div class="button"><IconButton iconName={IconCheck} on:click={check} /></div>
		</div>
		<div class="header__right">
			<div class="button"><IconButton iconName={IconSwap} on:click={refresh} /></div>
		</div>
		
	</div>
	<div class="menu__wrap">
		{#each libs as components, i}
			<Libraries library={components} index={i} />
		{/each}
	</div>
</div>

<style>
:global(body) {
	/* font-family: "Inter", sans-serif; */
	font-size: 11px;
}

.menu__wrap {
	position: relative;
	/* top: 50px; */
}
.header {
	display: flex;
	align-items: middle;
}
.header__right {
	margin-left: auto;
}

.header__left,
.header__right {
	display: flex;
}

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
    border-right: 5px solid rgba(0, 0,0,0.4);
    border-bottom: 10px solid rgba(0, 0,0,0.4);
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

.lock {
	overflow: hidden;
	height: 100%;
	width: 100%;
	pointer-events: none;
}
.lock * {
	pointer-events: none;
}
</style> 