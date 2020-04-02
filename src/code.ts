figma.showUI(__html__, { width: 300, height: 100 });

figma.ui.postMessage({loadState: 'INIT'});

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
	const frames = figma.currentPage.children

	const centerX = figma.viewport.center.x;
	const centerY = figma.viewport.center.y;
	
	figma.currentPage.selection = [instance];
	
	instance.x = figma.viewport.center.x - (instance.width/2);
	instance.y = figma.viewport.center.y - (instance.height/2);

	figma.ui.postMessage({ notify: 'hide' });

	for (let i = 0; i < frames.length; i++) {
		if (frames[i].type === "FRAME") {
			const frame = frames[i] as FrameNode;
			if (instance.x  > frame.x && instance.x  < frame.x + frame.width &&
				instance.y > frame.y && instance.y < frame.y + frame.height) {
				frame.appendChild(instance);
				instance.x = figma.viewport.center.x - frame.x - (instance.width / 2);
				instance.y = figma.viewport.center.y - frame.y - (instance.height / 2);
				return		
			}
		}		
	}
}

function resize(size) {
	figma.ui.resize(size.width, size.height);
}

const insertTeamComponent = async (key) => {

	figma.ui.postMessage({ notify: 'show' });

	try {
		const c = await figma.importComponentByKeyAsync(key);
		insertComponentById(c.id);
	} catch(e) {
		figma.notify(e)
		figma.ui.postMessage({ notify: 'hide' });
	}
}

const Libs = {
	storageKey :'Test13',
	libs : {},
	components : [],
	isTeamLibrary : false,
	
	getLocalComponents() {
		// fetches all of the documents local components
		// and stores them into this.components.
		this.components = [];
		for (let index = 0; index < figma.root.children.length; index++) {
			const page = figma.root.children[index];
			const components = page.findAll(node => node.type === "COMPONENT");
			const source = figma.root.name; // guess we'll just throw this on the component for later
			for (let index = 0; index < components.length; index++) {
				const component = components[index];
				let row: { key?: string, name?: string, id?: string, source?: string} = {};
				if (component.parent.type === "FRAME") {
					let frame = component.parent.name;;
					row.name = frame + '/' + component.name;
				} else {
					row.name = component.name;
				}
				row.id = component.id;
				row.source = source;

				// key is an empty string on team components
				if (component.key !== '') {
					row.key = component.key;
					this.isTeamLibrary = true;
				}
				this.components.push(row);
			}
			this.components.sort(compare);
		}
		if (this.isTeamLibrary) {
			// check for updates
			Libs.checkLibForUpdate(this.components);
		}
		return this.components;
	},
	
	buildLocalComponents() {
		this.getLocalComponents();
		figma.ui.postMessage({ 'components': this.components })
		
	},

	async loadStoredTeamLibraries() {
		const storage = await figma.clientStorage.getAsync(this.storageKey);
		console.log(storage)
		figma.ui.postMessage({'libs':storage});
	},
	
	async addLib(lib:String) {
		await this.fetchLibraryStore();
		this.libs[lib] = this.components;
		await figma.clientStorage.setAsync(this.storageKey, this.libs);
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
		const storage = await figma.clientStorage.getAsync(this.storageKey);
		if (typeof storage === 'undefined') {
			await figma.clientStorage.setAsync(this.storageKey, {});
		}
	},
	async fetchLibraryStore() {
		const storage = await figma.clientStorage.getAsync(this.storageKey);
		this.libs = storage;
	},
	async checkLibs() {
		const storage = await figma.clientStorage.getAsync(this.storageKey);
		return storage;
	},

	async checkLibForUpdate(localComponents) {
		const storage = await figma.clientStorage.getAsync(this.storageKey);

		if (typeof storage[figma.root.name] === 'undefined'){
			figma.ui.postMessage({ 'team': { type: 'add', message: `Add Team Library "${figma.root.name}"`, count: `${localComponents.length}` } })
		}
		if (storage[figma.root.name].length !== localComponents.length) {
			figma.ui.postMessage({ 'team': { type: 'update', message: `Update Team Library "${figma.root.name}"`, count: `${storage[figma.root.name].length - localComponents.length}` } })
		}
	},

	async removeLib(lib:String) {
		await this.fetchLibraryStore();
		delete this.libs[(lib as any)];
		await figma.clientStorage.setAsync(this.storageKey, this.libs);
	}
}

figma.ui.onmessage = msg => {
	if (msg.type === 'load') {
		Libs.initStorage();
		Libs.buildLocalComponents();
		Libs.loadStoredTeamLibraries();
		figma.ui.postMessage({ loadState: 'READY' });
	}
	if (msg.type === 'create-component') {
		if (typeof msg.component.key === 'undefined') {
			insertComponentById(msg.component.id);
		} else {
			insertTeamComponent(msg.component.key)
		}
	}
	if (msg.type === 'add') {
		// console.log('clicked add')
		Libs.storeTeamLibrary(figma.root.name);
	}
	if (msg.type === 'check') {
		Libs.checkLibs();
	}
	if (msg.type === 'remove') {
		Libs.removeLib(msg.key);
	}
	if (msg.type === 'resize') {
		resize(msg.size);
	}
	if (msg.type === 'refresh') {
		figma.showUI(__html__, { width: 300, height: 100 });
		Libs.initStorage();
		Libs.buildLocalComponents();
		Libs.loadStoredTeamLibraries();
		figma.ui.postMessage({ loadState: 'READY' });
	}
	
}