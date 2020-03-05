<script>
	import Menu from "./Menu.svelte";

	let components = [];
	let data;
	let documentName;
	// msgs from main code
	onmessage = async (event) => {
		if (event.data.pluginMessage.components.length) {
			data = event.data.pluginMessage.components;
			// const reversed = data.reverse();
			buildComponents(data);
		} 
		if (event.data.pluginMessage.page.length) {
			documentName = event.data.pluginMessage.page;
		} 
	}
	 function splitPath(obj, ckeyPath, value, key) {
		
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
						// console.log(component);
						return Object.assign({ name }, { key: component.key, id: component.id, components: transform(component) })
					} else {
						// console.log(object);
						// console.log(component);
						// console.log(component)
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
			console.log(data[i].key)
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
</script>


<div id="root">
	<div class="footer">
		<button on:click={storeComponents}>Store Components</button>
		<button on:click={loadComponents}>Load Components</button>
	</div>
	<Menu components={components} />
</div>

<style>
.footer {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 50px;
	background: white;
}
</style>