<script>
	
	import Libraries from "./Libraries.svelte";
	import { GlobalCSS } from 'figma-plugin-ds-svelte';
	import { Button, Input, IconSpinner, SelectMenu, IconButton, IconCheck, Icon, IconPlus, IconLibrary, IconSwap } from 'figma-plugin-ds-svelte';
	import Notification from './Notification.svelte';
	import TeamComponentsEmpty from './TeamComponentsEmpty.svelte';
	import LocalComponentsEmpty from './LocalComponentsEmpty.svelte';
	import DragHandle from './DragHandle.svelte';


	let libs = [];
	let teamLibsCount = 0;
	let localComponentsCount = 0;

	$ : notification = 'hide';

	$: info = '';

	$: loadState = 'LOADING';

	$: takingLong = false;

	onmessage = async (event) => {

		// LOCAL COMPONENTS
		if (event.data.pluginMessage.components) {
			// console.log('local')
			let data = event.data.pluginMessage.components;
			// no components
			
			if (data.length === 0) {
				return
			} else {
				localComponentsCount = 1;
				buildComponents(data, "Local Components");
			}
			
		}

		// TEAM COMPONENTS FROM CLIENTSTORAGE
		if (event.data.pluginMessage.libs) {
			let data = event.data.pluginMessage.libs;
			let keys = Object.keys(data);
			teamLibsCount = keys.length;

			for (let i = 0; i < keys.length; i++) {
				buildComponents(data[keys[i]], keys[i]);
			}
			setTimeout(() => {
				autoSize();
			}, 100);
		}

		if (event.data.pluginMessage.notify) {
			notification = event.data.pluginMessage.notify;
		}
		if (event.data.pluginMessage.info) {
			info = event.data.pluginMessage.info;
		}
		if (event.data.pluginMessage.team) {
			info = event.data.pluginMessage.team.message;
		}
		if (event.data.pluginMessage.loadState) {
			const state = event.data.pluginMessage.loadState;

			if (state === 'INIT') {
				
				setTimeout(() => {
					parent.postMessage({pluginMessage: {
						'type':'refresh'
					}}, '*');
				}, 100);
			}

			if (state === 'READY') {
				loadState = 'READY'
				
			}

		}		
	}

	function splitPath(obj, ckeyPath, value, key, type) {
		for (let i = 0; i < ckeyPath.length; i++) {
			let ckey = ckeyPath[i].trim(); // name

			if (!(ckey in obj)) {
				obj[ckey] = {};
				obj[ckey].id = value;
				obj[ckey].key = key;
				obj[ckey].type = type;
			}
			if (typeof obj.id === 'undefined') {
				obj.id = value;
				obj.key = key;
				obj.type = type;
			}
			obj = obj[ckey];
		}
	}
	function autoSize() {
		const rect = document.getElementById('root').getClientRects()[0];
		const size = {width: rect.width, height: rect.height}
		parent.postMessage({pluginMessage: {
			'type': 'resize',
			'size': size
		}}, '*');

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
						return Object.assign({ name }, { key: component.key, id: component.id, type: component.type, components: transform(component) })
					} else {
						return Object.assign({ name }, { key: component.key, id: component.id, type: component.type })
					}      
				} 
			}
		);
	}

	function buildComponents(data, key) {
		let map = {};
		for (let i = 0; i < data.length; i++) {
			let split = data[i].name.split('/');
			splitPath(map, split, data[i].id, data[i].key, data[i].type);
		}
		let components = transform(map);
		components[0].source = key; // eh
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
		info = 'Adding library...'
		parent.postMessage({pluginMessage: {
			'type':'add'
		}}, '*');
		setTimeout(() => {
			parent.postMessage({pluginMessage: {
				'type': 'refresh'
			}}, '*');
		}, 100);
	}
	function check() {
		parent.postMessage({pluginMessage: {
			'type':'check'
		}}, '*');
	}
	function remove(event) {
		parent.postMessage({pluginMessage: {
        	'type':'remove', key: event.detail.key
    	}}, '*');
		setTimeout(() => {
			parent.postMessage({pluginMessage: {
				'type': 'refresh'
			}}, '*');
		}, 300);
	}
	function load() {
		parent.postMessage({pluginMessage: {
			'type':'load'
		}}, '*');
	}
	function refresh() {
		loadState = 'LOADING';
		setTimeout(() => {
			parent.postMessage({pluginMessage: {
				'type': 'refresh'
			}}, '*');
		}, 100);
	}
 
	$: dragging = false;


	function drag(event) {
		dragging = event.detail.dragging
		// console.log(event.detail.dragging)
	}

	$: showHelp = false;

	function help() {
		showHelp = !showHelp;
			setTimeout(() => {
			if (showHelp === true) {
				const size = {width: 360, height: 480}
				parent.postMessage({pluginMessage: {
					'type': 'resize',
					'size': size
				}}, '*');
			}
		}, 10);
	}
</script>

{#if (loadState === 'LOADING')}
	<div class="loading">
		<div class="icon"><Icon iconName={IconSpinner} spin /></div>Building components menu...
	</div>
	<div class="takingLong">
		This may take a moment with larger documents.
	</div>
{:else if (loadState === 'READY')}
	<Notification visible={notification}/>
	<DragHandle dragging={false} on:drag={drag} />

	<div id="root" class={dragging? 'lock':'unlock'}>
		{#if info.length}
		<div class="message">
			<Button  on:click={add} variant="tertiary">{info}</Button>
		</div>
		{/if}

		<div class="menu__wrap">
			{#if Object.keys(libs).length}
			{#each libs as components, i}
				<Libraries on:remove={remove} localComponentsCount={localComponentsCount} library={components} count={libs.length} teamLibsCount={teamLibsCount} index={i} />
			{/each}
			{:else}
				<LocalComponentsEmpty />
				<TeamComponentsEmpty />
			{/if}
		</div>

		<div class="footer">
			<!-- <button on:click={help} class="footer__button">Help</button> -->
			<button on:click={refresh} class="footer__button">Refresh</button>
		</div>
	</div>

	{#if showHelp}
		<div class="help">
			<button on:click={help}>Close</button>
			Team Libraries
Team libraries are supported with a small workaround.

<strong>To add a team library:</strong>
<ol>
<li>Open the source library document and launch this plugin.</li>
<li>Click "Add Team Library". The library should then appear in the "Saved Team Libraries" section.
Note: This does not "copy" the team library, it stores a reference to it so all component connections maintain their connection.</li>
</ol>

<strong>To update a team library:</strong>
<ol>
<li>Open the source library document and launch this plugin.</li>
<li>Click "Update Team Library".</li>
</ol>

<strong>To remove a team library:</strong>
<ol>
<li>Click the minus sign next to any saved team library to remove it. To re-add, follow the steps to add the library.</li>
</ol>

<strong>To use components from saved team libraries:</strong>
<ol>
<li>Assuming the team library has been added, enable the team library via Figma's assets panel as normal.</li>
</ol>
		</div>
	{/if}

{/if}

<style>
:global(button) {
	background-color:  transparent;
}
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

.lock {
	overflow: hidden;
	height: 100%;
	width: 100%;
	pointer-events: none;
}
.lock * {
	pointer-events: none;
}
.loading {
	display: flex;
	align-items: center;
	padding-left: 16px;
	padding-top: 8px;
}

.takingLong {
	opacity: 0;
	animation-duration: 1ms;
	animation-delay: 2000ms;
	animation-fill-mode: forwards;
  	animation-name: slidein;
	padding-left: 45px;
	font-size: var(--size-xxsmall);
}
.message {
	padding-left: 16px;
}

#root {
	padding-bottom: 32px;
}
.footer {
	border-top: 1px solid var(--black1);
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 32px;
	display: flex;
	background-color: white;
	padding-left: 16px;
}

.footer__button {
	margin-right: 12px;	
	border: 0;
	background-color: none;
	outline: 0;
	cursor: pointer;
	color: var(--black3);
}
@keyframes slidein {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.help {
	padding: 32px;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: white;
	z-index: 10;
}
</style> 