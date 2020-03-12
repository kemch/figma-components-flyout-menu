<script>
	
	import Libraries from "./Libraries.svelte";
	import { GlobalCSS } from 'figma-plugin-ds-svelte';
	import { Button, Input, SelectMenu } from 'figma-plugin-ds-svelte';

	// let components = [];
	let libs = [];

	$: console.log(libs);

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
</script>


<div id="root">
	<div class="footer">
		<button on:click={add}>Add</button>
		<button on:click={check}>Check</button>
		<button on:click={remove}>Remove</button>
		<button on:click={refresh}>Refresh</button>
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
.footer {
	background: white;
}
.menu__wrap {
	position: relative;
	top: 50px;
}
</style>