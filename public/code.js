'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

figma.showUI(__html__, { width: 360, height: 400 });
function compare(a, b) {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}
function insertComponentById(id) {
    const instance = figma.getNodeById(id).createInstance();
    const frames = figma.currentPage.children;
    if (frames.length === 0) {
        console.log('no frames on this page');
    }
    const centerX = figma.viewport.center.x;
    const centerY = figma.viewport.center.y;
    console.log(`viewport x: ${figma.viewport.center.x}`);
    figma.currentPage.selection = [instance];
    instance.x = figma.viewport.center.x - (instance.width / 2);
    instance.y = figma.viewport.center.y - (instance.height / 2);
    figma.ui.postMessage({ notify: 'hide' });
    for (let i = 0; i < frames.length; i++) {
        if (frames[i].type === "FRAME") {
            const frame = frames[i];
            if (instance.x > frame.x && instance.x < frame.x + frame.width &&
                instance.y > frame.y && instance.y < frame.y + frame.height) {
                frame.appendChild(instance);
                instance.x = figma.viewport.center.x - frame.x - (instance.width / 2);
                instance.y = figma.viewport.center.y - frame.y - (instance.height / 2);
                return;
            }
        }
    }
}
function resize(size) {
    figma.ui.resize(size.width, size.height);
}
const insertTeamComponent = (key) => __awaiter(void 0, void 0, void 0, function* () {
    figma.ui.postMessage({ notify: 'show' });
    try {
        const c = yield figma.importComponentByKeyAsync(key);
        insertComponentById(c.id);
    }
    catch (e) {
        figma.notify(e);
        figma.ui.postMessage({ notify: 'hide' });
    }
});
const Libs = {
    storageKey: 'Test13',
    libs: {},
    components: [],
    isTeamLibrary: false,
    getLocalComponents() {
        // fetches all of the documents local components
        // and stores them into this.components.
        for (let index = 0; index < figma.root.children.length; index++) {
            const page = figma.root.children[index];
            const components = page.findAll(node => node.type === "COMPONENT");
            const source = figma.root.name; // guess we'll just throw this on the component for later
            for (let index = 0; index < components.length; index++) {
                const component = components[index];
                let row = {};
                if (component.parent.type === "FRAME") {
                    let frame = component.parent.name;
                    row.name = frame + '/' + component.name;
                }
                else {
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
        return this.components;
    },
    buildLocalComponents() {
        this.getLocalComponents();
        // figma.ui.postMessage({ 'components': this.libs["Local"] })
        figma.ui.postMessage({ 'components': this.components });
    },
    sendStoredComponents() {
        // figma.ui.postMessage({ 'libs': this.loadStoredTeamLibraries() })
    },
    loadStoredTeamLibraries() {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = yield figma.clientStorage.getAsync(this.storageKey);
            figma.ui.postMessage({ 'libs': storage });
        });
    },
    addLib(lib) {
        return __awaiter(this, void 0, void 0, function* () {
            // must be a team lib
            // lib = figma.root.name;
            // console.log('hi')
            // console.log(this.checkForTeamLibrary());
            // await this.checkLibs()
            yield this.fetchLibraryStore();
            // if (typeof this.libs === 'undefined') {
            // 	figma.clientStorage.setAsync(this.storageKey, "hi");
            // }
            // console.log(this.components)
            // console.log(typeof this.libs)
            this.libs[lib] = this.components;
            // console.log(this.libs);
            yield figma.clientStorage.setAsync(this.storageKey, this.libs);
            // console.log(this.libs)
            // console.log(this.libs.lib1)	
        });
    },
    // this could just be addLib since 
    // only team libraries can be added
    storeTeamLibrary(lib) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isTeamLibrary === true) {
                console.log('This is a team library.');
                this.addLib(lib);
            }
            else {
                figma.notify('This is not a team library.');
            }
        });
    },
    initStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = yield figma.clientStorage.getAsync(this.storageKey);
            if (typeof storage === 'undefined') {
                yield figma.clientStorage.setAsync(this.storageKey, {});
            }
        });
    },
    fetchLibraryStore() {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = yield figma.clientStorage.getAsync(this.storageKey);
            this.libs = storage;
        });
    },
    checkLibs() {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = yield figma.clientStorage.getAsync(this.storageKey);
            console.log(storage);
            // console.log(this.libs)
            // console.log(typeof storage);
            // console.log(await figma.clientStorage.getAsync(this.storageKey))
            return storage;
            // console.log(this.libs)
        });
    },
    // This needs to be refactored
    // to remove a library by name
    // probably from UI
    removeLib(lib) {
        return __awaiter(this, void 0, void 0, function* () {
            // lib = figma.root.name;
            yield this.fetchLibraryStore();
            delete this.libs[lib];
            yield figma.clientStorage.setAsync(this.storageKey, this.libs);
        });
    }
};
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
        }
        else {
            insertTeamComponent(msg.component.key);
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
        // console.log(msg.key)
        Libs.removeLib(msg.key);
        figma.showUI(__html__, { width: 360, height: 400 });
        Libs.initStorage();
        Libs.buildLocalComponents();
        Libs.loadStoredTeamLibraries();
    }
    if (msg.type === 'resize') {
        resize(msg.size);
    }
    if (msg.type === 'refresh') {
        figma.showUI(__html__, { width: 360, height: 400 });
        Libs.initStorage();
        Libs.buildLocalComponents();
        Libs.loadStoredTeamLibraries();
    }
};
