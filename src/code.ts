figma.showUI(__html__);

// fetchStoredTeamLibraries()

// const storageKey = "FOMTeamLibs";

// let menu = [];
// let libs = {};
// let lib = "Local"


function compare(a, b) {
	if (a.name < b.name) {
		return -1;
	}
	if (a.name > b.name) {
		return 1;
	}
	return 0;
}

function insertComponentById(id:string) {
	
	const instance = (figma.getNodeById(id) as any).createInstance();

	instance.x = figma.viewport.center.x - (instance.width/2);
	instance.y = figma.viewport.center.y - (instance.height/2);

	// figma.selection
	figma.currentPage.selection = [instance];

	// figma.viewport.scrollAndZoomIntoView([instance]);
	// figma.notify(`Inserted ${id}`)
}

function resize(size:object) {
	figma.ui.resize(size.width, size.height);
}

const insertTeamComponent = async (key) => {
	figma.notify('Fetching...')
	try {		
		const c = await figma.importComponentByKeyAsync(key);
		insertComponentById(c.id);
	} catch(e) {
		figma.notify(e)
	}
}

const Libs = {
	storageKey :'Test11',
	libs : {},
	components : [],
	isTeamLibrary : false,
	
	getLocalComponents() {
		// fetches all of the documents local components
		// and stores them into this.components.
		// this.fetchLibraryStore();

		for (let index = 0; index < figma.root.children.length; index++) {
			const page = figma.root.children[index];
			const components = page.findAll(node => node.type === "COMPONENT");

			for (let index = 0; index < components.length; index++) {
				const component = components[index];
				// console.log(component.key)
				let row: { key?: string, name?: string, id?: string } = {};
				if (component.parent.type === "FRAME") {
					let frame = component.parent.name;;
					row.name = frame + '/' + component.name;
				} else {
					row.name = component.name;
				}
				row.id = component.id;

				// key is an empty string on team components
				if (component.key !== '') {
					row.key = component.key;
					this.isTeamLibrary = true;
				}
				this.components.push(row);
			}
			this.components.sort(compare);
		}
		return this.components;
	},
	// fetchComponents(lib:String) {
	// 	// params = lib?
	// 	// Sends components to be rendered in the UI
	// 	this.getLocalComponents(lib);

	// 	figma.ui.postMessage({ 'components': this.components });
	// },
	buildLocalComponents() {
		this.getLocalComponents();
		// figma.ui.postMessage({ 'components': this.libs["Local"] })
		figma.ui.postMessage({ 'components': this.components })
		
	},

	sendStoredComponents() {
		// figma.ui.postMessage({ 'libs': this.loadStoredTeamLibraries() })
	},

	async loadStoredTeamLibraries() {
		const storage = await figma.clientStorage.getAsync(this.storageKey);

		figma.ui.postMessage({'libs':storage});
	},
	
	async addLib(lib:String) {
		// must be a team lib
		// lib = figma.root.name;
		// console.log('hi')
		// console.log(this.checkForTeamLibrary());
		// await this.checkLibs()
		await this.fetchLibraryStore();
		// if (typeof this.libs === 'undefined') {
		// 	figma.clientStorage.setAsync(this.storageKey, "hi");
		// }
		// console.log(this.components)
		// console.log(typeof this.libs)
		this.libs[lib] = this.components;
		console.log(this.libs);
		await figma.clientStorage.setAsync(this.storageKey, this.libs);
		// console.log(this.libs)
		// console.log(this.libs.lib1)	
	},

	// this could just be addLib since 
	// only team libraries can be added
	async storeTeamLibrary(lib) {
		if (this.isTeamLibrary === true) {
			console.log('This is a team library.')
			this.addLib(lib);
		} else {
			figma.notify('This is not a team library.')
		}
	},
	async initStorage() {
		// places a key in a storage if it does not exist.
	
		const storage = await figma.clientStorage.getAsync(this.storageKey);
		console.log(storage)
		if (typeof storage === 'undefined') {
			await figma.clientStorage.setAsync(this.storageKey, {});
		}
		console.log(storage)
	},
	async fetchLibraryStore() {
		const storage = await figma.clientStorage.getAsync(this.storageKey);
		this.libs = storage;
	},
	async checkLibs() {
		const storage = await figma.clientStorage.getAsync(this.storageKey);
		console.log(storage)
		console.log(this.libs)
		// console.log(typeof storage);
		console.log(await figma.clientStorage.getAsync(this.storageKey))
		return storage;
		// console.log(this.libs)
	},

	// This needs to be refactored
	// to remove a library by name
	// probably from UI
	async removeLib(lib:String) {
		lib = figma.root.name;
		await this.checkLibs()
		delete this.libs[(lib as any)];
		await figma.clientStorage.setAsync(this.storageKey, this.libs);
	}
}
Libs.initStorage();

Libs.buildLocalComponents();
Libs.loadStoredTeamLibraries();
// Libs.addLib("Local");
// console.log(Libs.components)

// console.log(Libs)

figma.ui.onmessage = msg => {
	if (msg.type === 'create-component') {
		if (typeof msg.component.key === 'undefined') {
			insertComponentById(msg.component.id);
		} else {
			insertTeamComponent(msg.component.key)
		}
	}
	if (msg.type === 'add') {
		console.log('clicked add')
		Libs.storeTeamLibrary(figma.root.name);
	}
	if (msg.type === 'check') {
		Libs.checkLibs();
	}
	if (msg.type === 'remove') {
		Libs.removeLib(figma.root.name);
	}
	// if (msg.type === 'store') {
	// 	let isTeamLibrary = false;
	// 	for (let i = 0; i < menu.length; i++) {
	// 		if (menu[i].key !== '') {
	// 			isTeamLibrary = true;
	// 		}
	// 	}
	// 	// console.log(isTeamLibrary)
	// 	if (isTeamLibrary === true) {
	// 		storeTeamLibrary();
	// 	} else {
	// 		figma.notify('This is not a team library.')
	// 	}
	// 	isTeamLibrary = false;
	// }
	if (msg.type === 'load') {
		loadStoredTeamComponent()
	}
	if (msg.type === 'resize-ui') {
		resize(msg.size);
	}
	// if (msg.type === 'remove') {
	// 	figma.clientStorage.setAsync(storageKey, '');
	// 	figma.notify('Cleared')
	// }
	
}
// async function storeTeamLibrary() {
// 	const result = await figma.clientStorage.getAsync(storageKey);
// 	const document = figma.root.name;
// 	libs[document] = result;
// 	console.log(libs);
// 	console.log(result);
	
// 	figma.clientStorage.setAsync(storageKey, libs[document]);
// 	// figma.notify('Stored library')
// }
async function checkLocalStorage() {
	const result = await figma.clientStorage.getAsync(storageKey);
	console.log(result)
}
async function fetchStoredTeamLibraries() {
	const result = await figma.clientStorage.getAsync(storageKey);
	// console.log('stored:')
	// console.log(result);
	if (result === '' || typeof result === 'undefined') {
		figma.notify('There are no team libraries stored');
	}
	// else {
	// 	libs = result;
	// }
}
async function loadStoredTeamComponent() {
	// fetchStoredTeamLibraries()
	// console.log(libs);
	// const result = await figma.clientStorage.getAsync(storageKey);
	// figma.ui.postMessage({ 'components': result });
	// console.log(result);
}

// // This plugin will open a modal to prompt the user to enter a number, and
// // it will then create that many rectangles on the screen.

// // This file holds the main code for the plugins. It has access to the *document*.
// // You can access browser APIs in the <script> tag inside "ui.html" which has a
// // full browser enviroment (see documentation).

// // This shows the HTML page in "ui.html".
// figma.showUI(__html__, {width: 232, height: 208 });

// // Calls to "parent.postMessage" from within the HTML page will trigger this
// // callback. The callback will be passed the "pluginMessage" property of the
// // posted message.
// figma.ui.onmessage = msg => {
// 	// One way of distinguishing between different types of messages sent from
// 	// your HTML page is to use an object with a "type" property like this.
// 	if (msg.type === 'create-shapes') {

// 		const nodes: SceneNode[] = [];

// 		for (let i = 0; i < msg.count; i++) {

// 			var shape;

// 			if (msg.shape === 'rectangle') {
// 				shape = figma.createRectangle();
// 			} else if (msg.shape === 'triangle') {
// 				shape = figma.createPolygon();
// 			} else {
// 				shape = figma.createEllipse();
// 			}

// 			shape.x = i * 150;
// 			shape.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
// 			figma.currentPage.appendChild(shape);
// 			nodes.push(shape);
// 		}

// 		figma.currentPage.selection = nodes;
// 		
// 	}

// 	// Make sure to close the plugin when you're done. Otherwise the plugin will
// 	// keep running, which shows the cancel button at the bottom of the screen.
// 	figma.closePlugin();
// };
