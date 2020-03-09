<script>
	import Menu from "./Menu.svelte";

	let components = [];
	let libs = [];
	let data;
	let documentName;
	// msgs from main code
	// onmessage = async (event) => {
	// 	console.log(event)
	// }
	onmessage = async (event) => {

		// if (event.data.pluginMessage)
		// console.log(event.data.pluginMessage.components)

		if (event.data.pluginMessage.libs) {
			console.log('team')
			libs = Object.keys(event.data.pluginMessage.libs);
			console.log(libs)
			for (let i = 0; i < Object.keys(event.data.pluginMessage.libs).length; i++) {
				const element = Object.keys(event.data.pluginMessage.libs)[i];
				libs.push(buildComponents(event.data.pluginMessage.libs[element]));
			}
		}
		

		if (event.data.pluginMessage.components) {
			console.log('local')
			data = event.data.pluginMessage.components;
			buildComponents(data);
		}
		
	// 	// if (event.data.pluginMessage.components.length) {
	// 		// console.log(event.data.pluginMessage.components)
	// 		data = event.data.pluginMessage.components;
	// 		buildComponents(data);
	// 		console.log(event)

	// 		// console.log(event.data.pluginMessage.libraries)
	// 		// const libs = Object.keys(data);
	// 		// console.log(libs)

	// 		// console.log(event.data.pluginMessage.libraries);
	// 		// for (let i = 0; i < libs.length; i++) {
	// 		// 	if  (libs[i] === "Local") {
	// 		// 		buildComponents(data[libs[i]]);
	// 		// 	}
	// 		// }
	// 		// console.log(Object.keys(data))
	// 		// const reversed = data.reverse();
	// 	// } 
	// 	// if (event.data.pluginMessage.page.length) {
	// 	// 	documentName = event.data.pluginMessage.page;
	// 	// } 

	}
	
	 function splitPath(obj, ckeyPath, value, key) {
		// console.log(key)
		// console.log(value)
		for (let i = 0; i < ckeyPath.length; i++) {
			let ckey = ckeyPath[i].trim(); // name

			if (!(ckey in obj)) {
				obj[ckey] = {};
				obj[ckey].id = value;
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
					if (Object.keys(component).length > 1) {
						return Object.assign({ name }, { key: component.key, id: component.id, components: transform(component) })
					} else {
						return Object.assign({ name }, { key: component.key, id: component.id })
					}      
				} 
			}
		);
	}

	

	function buildComponents(data){

		let map = {};
		for (let i = 0; i < data.length; i++) {
			let split = data[i].name.split('/');
			// console.log(data[i].key)
			splitPath(map, split, data[i].id, data[i].key);
		}

		components = transform(map);
		// console.log(components);
		return components;
	}

	function storeComponents() {
		
		// console.log(data)
		// console.log(documentName)
		parent.postMessage({pluginMessage: {
			'type':'store'
		}},'*');
		// figma.clientStorage.setAsync('hello','world');
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
	function checkComponents() {
		parent.postMessage({pluginMessage: {
			'type':'check'
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
</script>


<div id="root">
<div class="footer">
	<button on:click={add}>Add</button>
	<button on:click={check}>Check</button>
	<button on:click={remove}>Remove</button>
</div>
	<!-- <div class="footer">
		<button on:click={storeComponents}>Store Components</button>
		<button on:click={loadComponents}>Load Components</button>
		<button on:click={removeComponents}>Remove Components</button>
		<button on:click={checkComponents}>Check</button>
	</div> -->
	<div class="menu__wrap">
		<Menu components={components} />
	</div>
	{#each libs as lib} 
		<Menu components={lib} />
	{/each}
</div>

<style>
.footer {
	/* position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: 50px; */
	background: white;
}
.menu__wrap {
	position: relative;
	top: 50px;
}
</style>