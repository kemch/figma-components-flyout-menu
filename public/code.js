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

figma.showUI(__html__);
let menu = [];
// Use findAll to traverse doocument for components.
// And if the component is inside a frame, get that too.
for (let index = 0; index < figma.root.children.length; index++) {
    const page = figma.root.children[index];
    const components = page.findAll(node => node.type === "COMPONENT");
    for (let index = 0; index < components.length; index++) {
        const component = components[index];
        // console.log(component.key)
        let row = {};
        if (component.parent.type === "FRAME") {
            let frame = component.parent.name;
            row.name = frame + '/' + component.name;
        }
        else {
            row.name = component.name;
        }
        row.id = component.id;
        if (typeof component.key !== 'undefined') {
            row.key = component.key;
        }
        menu.push(row);
    }
    menu.sort(compare);
    // console.log(menu);
    // send the menu object to the plugin UI.
    // console.log(figma.importComponentByKeyAsync('da2cb21626ffa68780b5fdb76876e2b8461c4cda'));
    // console.log(foo)
    // figma.currentPage.appendChild(foo);
    figma.ui.postMessage({ 'components': menu, 'page': figma.root.name });
}
function compare(a, b) {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}
function insertComponent(id) {
    const instance = figma.getNodeById(id).createInstance();
    // figma.currentPage.appendChild(instance);
    instance.x = figma.viewport.center.x;
    instance.y = figma.viewport.center.y;
}
function resize(size) {
    // let size.width:number;
    // figma.showUI(__html__, size);
    figma.ui.resize(size.width, size.height);
}
const trythis = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`3 ${key}`);
        const c = yield figma.importComponentByKeyAsync(key);
        // const c = await figma.importComponentByKeyAsync('da2cb21626ffa68780b5fdb76876e2b8461c4cda');
        console.log(`4 ${c}`);
        insertComponent(c.id);
    }
    catch (e) {
        console.log(e);
    }
    // console.log(c)
    // figma.currentPage.appendChild(c);
    // try {
    // 	const c = await figma.importComponentByKeyAsync('da2cb21626ffa68780b5fdb76876e2b8461c4cda');
    // 	figma.currentPage.appendChild(c);
    // 	console.log(c)
    // 	// console.log(await figma.importComponentByKeyAsync('da2cb21626ffa68780b5fdb76876e2b8461c4cda'))
    // } catch (e) {
    // 	figma.notify(e)
    // }
});
// trythis();
figma.ui.onmessage = msg => {
    // console.log(msg);
    if (msg.type === 'create-component') {
        // insertComponent(msg.component);
        // console.log(msg.component)
        trythis(msg.component);
    }
    if (msg.type === 'resize-ui') {
        resize(msg.size);
    }
    if (msg.type === 'store') {
        console.log(menu);
        figma.clientStorage.setAsync('hello', menu);
        // asyncCall()
    }
    if (msg.type === 'load') {
        console.log(asyncCall());
        asyncCall();
    }
};
function asyncCall() {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log('calling');
        const result = yield figma.clientStorage.getAsync('hello');
        console.log(result);
        figma.ui.postMessage({ 'components': result, 'page': figma.root.name });
        // console.log(result);
        // return result;
        // expected output: 'resolved'
    });
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
// 		figma.viewport.scrollAndZoomIntoView(nodes);
// 	}
// 	// Make sure to close the plugin when you're done. Otherwise the plugin will
// 	// keep running, which shows the cancel button at the bottom of the screen.
// 	figma.closePlugin();
// };
