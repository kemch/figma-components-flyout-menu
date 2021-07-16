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

figma.showUI(__html__, { width: 300, height: 100 });
figma.ui.postMessage({ loadState: 'INIT' });
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
    const node = figma.getNodeById(id);
    let instance;
    if (node.type === "COMPONENT_SET") {
        instance = node.defaultVariant.createInstance();
    }
    else if (node.type === "COMPONENT") {
        instance = node.createInstance();
    }
    // const instance = (figma.getNodeById(id) as any).createInstance();
    const frames = figma.currentPage.children;
    const centerX = figma.viewport.center.x;
    const centerY = figma.viewport.center.y;
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
    // console.log(figma.viewport.bounds.height);
    // console.log(figma.viewport.zoom);
    if (size.auto) {
        // console.log('auto')
        size.height = size.height > figma.viewport.bounds.height * figma.viewport.bounds.height ? figma.viewport.bounds.height * figma.viewport.bounds.height : size.height;
    }
    figma.ui.resize(size.width, size.height);
}
const insertTeamComponent = (key, id) => __awaiter(void 0, void 0, void 0, function* () {
    figma.ui.postMessage({ notify: 'show' });
    try {
        const c = yield figma.importComponentByKeyAsync(key);
        insertComponentById(c.id);
    }
    catch (e) {
        figma.notify('Unable to import component. Make sure this team library is enabled in Assets > Team Library.');
        figma.ui.postMessage({ notify: 'hide' });
    }
});
const insertTeamComponentSet = (key, id) => __awaiter(void 0, void 0, void 0, function* () {
    figma.ui.postMessage({ notify: 'show' });
    try {
        const c = yield figma.importComponentSetByKeyAsync(key);
        insertComponentById(c.id);
    }
    catch (e) {
        figma.notify('Unable to import component. Make sure this team library is enabled in Assets > Team Library.');
        figma.ui.postMessage({ notify: 'hide' });
    }
});
const Libs = {
    storageKey: 'PLUGIN_ComponentsFlyoutMenu',
    libs: {},
    components: [],
    isTeamLibrary: false,
    getLocalComponents() {
        // fetches all of the documents local components
        // and stores them into this.components.
        this.components = [];
        for (let index = 0; index < figma.root.children.length; index++) {
            const page = figma.root.children[index];
            const components = page.findAll(node => node.type === "COMPONENT_SET" || (node.type === "COMPONENT" && node.parent.type !== "COMPONENT_SET"));
            // const components = page.findAll(node => node.type === "COMPONENT" );
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
                row.type = component.type;
                // key is an empty string on team components
                if (component.key !== '') {
                    row.key = component.key;
                    this.isTeamLibrary = true;
                }
                this.components.push(row);
            }
            this.components.sort(compare);
            // console.log(this.components)
        }
        if (this.isTeamLibrary) {
            // check for updates
            Libs.checkLibForUpdate(this.components);
        }
        return this.components;
    },
    buildLocalComponents() {
        this.getLocalComponents();
        figma.ui.postMessage({ 'components': this.components });
    },
    loadStoredTeamLibraries() {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = yield figma.clientStorage.getAsync(this.storageKey);
            // console.log(storage)
            figma.ui.postMessage({ 'libs': storage });
        });
    },
    addLib(lib) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetchLibraryStore();
            this.libs[lib] = this.components;
            yield figma.clientStorage.setAsync(this.storageKey, this.libs);
        });
    },
    // this could just be addLib since 
    // only team libraries can be added
    storeTeamLibrary(lib) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isTeamLibrary === true) {
                // console.log('This is a team library.')
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
            return storage;
        });
    },
    checkLibForUpdate(localComponents) {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = yield figma.clientStorage.getAsync(this.storageKey);
            if (typeof storage[figma.root.name] === 'undefined') {
                figma.ui.postMessage({ 'team': { type: 'add', message: `Add Team Library "${figma.root.name}"`, count: `${localComponents.length}` } });
            }
            if (storage[figma.root.name].length !== localComponents.length) {
                figma.ui.postMessage({ 'team': { type: 'update', message: `Update Team Library "${figma.root.name}"`, count: `${storage[figma.root.name].length - localComponents.length}` } });
            }
        });
    },
    removeLib(lib) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetchLibraryStore();
            delete this.libs[lib];
            yield figma.clientStorage.setAsync(this.storageKey, this.libs);
        });
    }
};
figma.ui.onmessage = msg => {
    if (msg.type === 'load') {
        Libs.initStorage();
        Libs.buildLocalComponents();
        Libs.loadStoredTeamLibraries();
        figma.ui.postMessage({ loadState: 'READY' });
    }
    if (msg.type === 'create-component-team') {
        if (typeof msg.component.key === 'undefined') {
            insertComponentById(msg.component.id);
        }
        else {
            if (msg.nodeType === "COMPONENT_SET") {
                insertTeamComponentSet(msg.component.key, msg.component.id);
            }
            else if (msg.nodeType === "COMPONENT") {
                insertTeamComponent(msg.component.key, msg.component.id);
            }
        }
    }
    if (msg.type === 'create-component-local') {
        insertComponentById(msg.component.id);
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
};
