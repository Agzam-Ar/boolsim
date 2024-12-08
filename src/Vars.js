
import Strings from './utils/Strings'
import BlockTypes from './logic/BlockTypes'

let nextId = 0;
let blocksPattle = [];

let history = [];
let historyIndex = -1;

let frames = {};


let state = {
	blocks: {},
	links: {},
};


const propsCount = (obj) => {
	let count = 0;
	for (let o of Object.values(obj)) {
		if(o != undefined) count++;
	}
	return count;
};

const encodeState = (state, props={version:1}) => {
	let encoded = "";
	encoded += Strings.encodeNumber(props.version);
	encoded += Strings.encodeNumber(propsCount(state.blocks));
	encoded += Strings.encodeNumber(propsCount(state.links));

	let shiftX = Infinity;
	let shiftY = Infinity;
	for (let block of Object.values(state.blocks)) {
		if(block == undefined) continue;
		shiftX = Math.min(shiftX, block.box.x);
		shiftY = Math.min(shiftY, block.box.y);
	}
	props.shiftX = shiftX == Infinity ? 0 : -shiftX;
	props.shiftY = shiftY == Infinity ? 0 : -shiftY;

	for (let block of Object.values(state.blocks)) {
		if(block == undefined) continue;
		encoded += block.encode(props);
	}

	for (let link of Object.values(state.links)) {
		if(link == undefined) continue;
		encoded += link.encode(props);
	}

	return encoded;
}

const decodeState = (code, props={index:0}) => {
	let version = Strings.decodeNumber(code, props);
	if(version < 0) return undefined;
	console.log("decoding ver", version);
	let decoded = {
		blocks: {},
		links: {},
	};
	props.state = decoded;
	let blocksCount = Strings.decodeNumber(code, props);
	let linksCount = Strings.decodeNumber(code, props);

	
	
	console.log("blocksCount", blocksCount);
	console.log("linksCount", linksCount);

	for (var i = 0; i < blocksCount; i++) {
		let b = Block.decode(code, props);
		decoded.blocks[b.id] = b;
	}

	for (var i = 0; i < linksCount; i++) {
		let w = Wire.decode(code, props);
		decoded.links[w.id] = w;
	}

	console.log("Decoded result: ", decoded);


	// encoded += Strings.encodeNumber(props.version);
	// encoded += Strings.encodeNumber(propsCount(state.blocks));
	// encoded += Strings.encodeNumber(propsCount(state.links));

	// let shiftX = Infinity;
	// let shiftY = Infinity;
	// for (let block of Object.values(state.blocks)) {
	// 	if(block == undefined) continue;
	// 	shiftX = Math.min(shiftX, block.box.x);
	// 	shiftY = Math.min(shiftY, block.box.y);
	// }
	// props.shiftX = shiftX == Infinity ? 0 : -shiftX;
	// props.shiftY = shiftY == Infinity ? 0 : -shiftY;

	// for (let block of Object.values(state.blocks)) {
	// 	if(block == undefined) continue;
	// 	encoded += block.encode(props);
	// }
	return decoded;
}

const applyDecodedState = (code) => {
	try {
		let decoded = decodeState(code);
		if(decoded != undefined) {
			state = decoded;
			nextId = 0;
			for (let b of Object.values(state.blocks)) {
				nextId = Math.max(nextId, b.id);
			}
			nextId++;
			Vars.$renderScheme();
			return decoded;
		} else {
			console.error("State not decoded");
		}
	} catch (e) {
		console.log(e);
	}
	return undefined;
}

const addToHistory = () => {
	historyIndex++;
	let copy = state;//JSON.parse(JSON.stringify(state));

	if(historyIndex < history.length) {
		history[historyIndex] = copy;
	} else {
		history.push(copy);
	}
	console.log(history);
}

let wirePreset;

const getLocalStorageItem = (key, def) => {
	let item = localStorage.getItem(key);
	if(item == null) return def;
	if(isNaN(item)) return def;
	return typeof(def) == 'number' ? parseFloat(item) : item;
};


let Vars = {
	// blockTypes: {
	// 	switch: 	0,
	// 	and: 		1,
	// 	or: 		2,
	// 	not: 		3,
	// 	node:		4,
	// 	lamp:		5,
	// },
	schemeSvg: () => document.getElementById('main-svg'),
	propsCount: propsCount,
	tilesize: 10,
	camera: {x:getLocalStorageItem('camera.x', 0), y:getLocalStorageItem('camera.y', 0), width: window.innerWidth, height: window.innerHeight, scale: getLocalStorageItem('camera.scale', 1/10)},
	mouse: {draggBlock: undefined, draggStart: undefined},
	selected: {},
	getNextId: () => nextId,
	createBlock: (props) => new Block(props),
	createLink: (props) => new Wire(props),
	getHistory: () => history,
	getHistoryIndex: () => historyIndex,
	getHistoryLastState: () => {
		return history[historyIndex];
	},
	getState: () => state,
	getBlocks: () => state.blocks,
	getLinks: () => state.links,
	wirePreset: () => wirePreset,

	getBlocksPattle: () => blocksPattle,
	$renderScheme: () => {},
	renderScheme: () => {
		if(JSON.stringify(Vars.getHistoryLastState()) != JSON.stringify(Vars.getState())) { // Vars.getHistoryLastState() != undefined && state != undefined) {
			// let lstate = Vars.getHistoryLastState();
			// console.log(propsCount(lstate.links), propsCount(state.links));
			// if(propsCount(lstate.links) != propsCount(state.links)) {
				addToHistory();
			// }
			
		}
		Vars.$renderScheme();
	},
	
	updates: 0,
	nextUpdate: () => Vars.updates++,
	updateBlocks: () => {
		let update = Vars.nextUpdate();
		// console.log('globalupdate', update);
		for (let b of Object.values(Vars.getBlocks())) {
			if(b != undefined) b.update(update);
		}
	},

	toSvgPoint(evt) {
		if(Vars.schemeSvg == undefined) return undefined;
		let svg = Vars.schemeSvg();
		if(svg == undefined) return undefined;
		let pt = svg.createSVGPoint();
	    pt.x = evt.clientX == undefined ? evt.x : evt.clientX;
	    pt.y = evt.clientY == undefined ? evt.y : evt.clientY;
	    return pt.matrixTransform(svg.getScreenCTM().inverse());
	},

	getSvgMousePos() {
		let transform = (p) => {
			if(p == undefined) return undefined;
			return {
			x: (p.x - window.innerWidth/2)*Vars.camera.scale + Vars.camera.x,
			y: (p.y - window.innerHeight/2)*Vars.camera.scale + Vars.camera.y,
		}};
		return transform(Vars.mouse.client);
	},

	frame: (name) => frames[name],
};


class Frame {
	
	constructor(props) {
		this.box 		= {x:0,y:0,w:Vars.tilesize,h:Vars.tilesize, minw:0, minh:0, overflow: "hidden"};
		for(let k of Object.keys(props)) {
			if(k == 'x' || k == 'y' || k == 'w' || k == 'h' || k == 'minw' || k == 'minh' || k == 'overflow') this.box[k] = props[k];
			else this[k] = props[k];
		}
		this.render = () => {};
	}
	
	hasPoint(p) {
		if(p.x < this.box.x) return false;
		if(p.y < this.box.y) return false;
		if(p.x > this.box.x + this.box.w) return false;
		if(p.y > this.box.y + this.box.h) return false;
		return true;
	}
}


frames["blocks-pattle"] = new Frame({
	x:getLocalStorageItem('frame.blocks-pattle.x', 10),
	y:getLocalStorageItem('frame.blocks-pattle.y', 10), 
	w:getLocalStorageItem('frame.blocks-pattle.w', window.innerHeight*3/20),
	h:getLocalStorageItem('frame.blocks-pattle.h', window.innerHeight*10/20), 
	minw:window.innerHeight*3/40, 	minh:window.innerHeight*10/40});


frames["blocks-inspector"] = new Frame({
	x:getLocalStorageItem('frame.blocks-inspector.x', window.innerWidth- window.innerHeight*7/20),
	y:getLocalStorageItem('frame.blocks-inspector.y', window.innerHeight*15/20), 
	w:getLocalStorageItem('frame.blocks-inspector.w', window.innerHeight*3/10),
	h:getLocalStorageItem('frame.blocks-inspector.h', window.innerHeight*4/20), 
	minw:window.innerHeight*3/40, 	minh:window.innerHeight*3/40});


frames["truth-table"] = new Frame({
	x:getLocalStorageItem('frame.truth-table.x', window.innerWidth- window.innerHeight*7/20),
	y:getLocalStorageItem('frame.truth-table.y', window.innerHeight*2/20), 
	w:getLocalStorageItem('frame.truth-table.w', window.innerHeight*3/10),
	h:getLocalStorageItem('frame.truth-table.h', window.innerHeight*4/20), 
	overflow: "auto",
	minw:window.innerHeight*3/40, 	minh:window.innerHeight*3/40});


window["Vars"] = Vars;

class Block {

	constructor(props) {
		this.classType = "Block";
		this.overlay = false;
		this.loopsStack = 0;
		if(props.preset == true) {
			this.id = `preset-${blocksPattle.length}`;
			blocksPattle.push(this);
			this.createBlock = () => {
				let pos = Vars.getSvgMousePos();
				let $props = Object.assign({}, props);
				$props.preset = undefined;
				$props.x = pos.x/Vars.tilesize;
				$props.y = pos.y/Vars.tilesize;
				$props.name = "";
				return new Block($props);
			}
		} else {
			this.id = nextId++;
			if(props.preset != true) Vars.getBlocks()[this.id] = this;
		}
		this.box 		= {x:0,y:0,w:Vars.tilesize,h:Vars.tilesize};
	    this.type 		= BlockTypes.all.switch;
	    this.active 	= false;
	    this.outputs = 1;
	    this.inputs  = 1;

	    if(props.preset == true) {
	    	this.box.x = 0;
	    	this.box.y = (blocksPattle.length-1)*20;
	    }
		
		if(props.type != undefined) this.type = props.type;

	    let type = BlockTypes[this.type];

	    if(type == undefined) {
	    	console.warn("Type", type, "not defined");
	    } else {
	    	if(type.inputs == undefined) console.warn(`Type "${type.name}" not has defined inputs amount`);
	    	else if(type.inputs.value != undefined) this.inputs = type.inputs.value;
	    	else if(type.inputs.min   != undefined) this.inputs = type.inputs.min;
	    	else if(type.inputs.max   != undefined) this.inputs = type.inputs.max;
	    	if(type.outputs == undefined) console.warn(`Type "${type.name}" not has defined outputs amount`);
	    	else if(type.outputs.value != undefined) this.outputs = type.outputs.value;
	    	else if(type.outputs.min   != undefined) this.outputs = type.outputs.min;
	    	else if(type.outputs.max   != undefined) this.outputs = type.outputs.max;
	    	// console.log(`${type.name} has ${this.inputs}i ${this.outputs}o`);
	    }
		
	    this.box.dragX 		= this.box.x;
	    this.box.dragY 		= this.box.y;

	    this.angle 		= 0;
	    this.name 		= "Unnamed";
		this.oPorts 	= [];
		this.iPorts 	= [];
		this.listeners  = {};

		for(let k of Object.keys(props)) {
			if(k == 'x' || k == 'y') {
				this.box[k] = props[k]*Vars.tilesize;
			}
			else this[k] = props[k];
		}
	    // console.log(`${type.name} has ${this.inputs}i ${this.outputs}o`);

		this.oPorts = [];
		for (var i = 0; i < this.outputs; i++) {
			let pos = this.getOutputPos(i);
			this.oPorts.push({x:this.box.x + pos.x, y:this.box.y + pos.y, dx:pos.x, dy:pos.y, drawSrcX:pos.srcX, drawSrcY:pos.srcY});
		}
		this.iPorts = [];
		for (var i = 0; i < this.inputs; i++) {
			let pos = this.getInputPos(i);
			this.iPorts.push({x:this.box.x + pos.x, y:this.box.y + pos.y, dx:pos.x, dy:pos.y, drawSrcX:pos.srcX, drawSrcY:pos.srcY});
		}
		this.updatePorts();
	}


	setActive(active) {
		this.active = active;
		this.update();
		Vars.frame("truth-table").render();
	}

	static decode(code, props) {
		let block = {x:0,y:0};
		let propcode = "";
		block.id = Strings.decodeNumber(code, props);
		block.type = Strings.decodeNumber(code, props);
		block.x = Strings.decodeNumber(code, props);
		block.y = Strings.decodeNumber(code, props);
		block.angle = Strings.decodeNumber(code, props);
		block.inputs = Strings.decodeNumber(code, props);
		block.outputs = Strings.decodeNumber(code, props);
		let nameLength = Strings.decodeNumber(code, props);
		block.name = code.substring(props.index, props.index + nameLength);
		props.index += nameLength;
		return new Block(block);
	}

	encode(props) {
		let encoded = "";
		encoded += Strings.encodeNumber(this.id);
		encoded += Strings.encodeNumber(this.type);
		encoded += Strings.encodeNumber((this.box.x+props.shiftX)/Vars.tilesize);
		encoded += Strings.encodeNumber((this.box.y+props.shiftY)/Vars.tilesize);
		encoded += Strings.encodeNumber(this.angle);
		encoded += Strings.encodeNumber(this.inputs);
		encoded += Strings.encodeNumber(this.outputs);
		let encodeName = encodeURIComponent(this.name);
		encoded += Strings.encodeNumber(encodeName.length);
		encoded += encodeName;
		return encoded;
	}

	remove() {
		Vars.getBlocks()[this.id] = undefined;
		Vars.renderScheme();
	}

	render() {
		if(this.elementListener != undefined) this.elementListener();
	}

	update(updateId) {
		if(updateId == this.lastUpdate) {
			this.loopsStack++;
			if(this.loopsStack > this.iPorts.length+10) {
				return;
			}
		} else {
			this.loopsStack = 0;
		}
		this.lastUpdate = updateId;

		let state = [];
		for (var i = 0; i < this.oPorts.length; i++) {
			state.push(this.oPorts[i].active);
		}
		this.updatePorts();
		
		let changed = false;
		for (var i = 0; i < this.oPorts.length; i++) {
			if(this.oPorts[i].active != state[i]) {
				changed = true;
				break;
			}
		}
		// if(this.name == 'X2') {
		// 	for (let l of Object.keys(this.listeners)) {
		// 		if(l != undefined) l(updateId);
		// 	}
		// }
		
		for (let l of Object.values(this.listeners)) {
			if(l != undefined) l(updateId);
		}
	}

	updatePorts() {
		if(this.iPorts.length != this.inputs) {
			let iPorts = [];
			for (var i = 0; i < this.inputs; i++) {
				let pos = this.getInputPos(i);
				if(this.iPorts[i] != undefined) iPorts.push(this.iPorts[i]);
				else iPorts.push({x:this.box.x + pos.x, y:this.box.y + pos.y, dx:pos.x, dy:pos.y, drawSrcX:pos.srcX, drawSrcY:pos.srcY});
			}
			this.iPorts = iPorts;
		}


		for (var i = 0; i < this.oPorts.length; i++) {
			let pos = this.getOutputPos(i);
			this.oPorts[i].x = this.box.x + pos.x;
			this.oPorts[i].y = this.box.y + pos.y;
			this.oPorts[i].dx = pos.x;
			this.oPorts[i].dy = pos.y;
			this.oPorts[i].drawSrcX = pos.srcX;
			this.oPorts[i].drawSrcY = pos.srcY;
		}
		for (var i = 0; i < this.iPorts.length; i++) {
			let pos = this.getInputPos(i);
			this.iPorts[i].x = this.box.x + pos.x;
			this.iPorts[i].y = this.box.y + pos.y;
			this.iPorts[i].dx = pos.x;
			this.iPorts[i].dy = pos.y;
			this.iPorts[i].drawSrcX = pos.srcX;
			this.iPorts[i].drawSrcY = pos.srcY;
		}
		if(BlockTypes[this.type].func != undefined) {
			let result = BlockTypes[this.type].func(this.active, this.iPorts, this.oPorts);
			if(result != undefined) {
				this.active = result;
			}
		}
	}
	
	getOutputPos(index) {
		let type = this.type;
		let box = this.box;
		
		let u1 = Math.min(box.w, box.h)*.3;
		let v1 = 0;

		let u2 = 0;
		let v2 = 0;

		if(BlockTypes[this.type].box != undefined && BlockTypes[this.type].box.out != undefined) {
			if(BlockTypes[this.type].box.out != undefined) u1 = BlockTypes[this.type].box.out.u1(box);
			if(BlockTypes[this.type].box.out != undefined) v1 = BlockTypes[this.type].box.out.v1(box);
			if(BlockTypes[this.type].box.out != undefined) u2 = BlockTypes[this.type].box.out.u2(box);
			if(BlockTypes[this.type].box.out != undefined) v2 = BlockTypes[this.type].box.out.v2(box);
		} else {
			// console.warn(`${BlockTypes[this.type].name} out box is not defined`);
		}
		return {x: this.transformX(u2,v2), y: this.transformY(u2,v2), srcX:this.transformX(u1,v1), srcY:this.transformY(u1,v1)};
	}

	getInputPos(index) {
		let type = this.type;
		let box = this.box;

		let u1 = -Math.min(box.w, box.h)*.3;
		let v1 = 0;

		let u2 = -10;
		let v2 = 0;

		let iDelta = this.inputs%2 == 1 ? Math.floor(index - this.inputs/2+1) : (index < this.inputs/2 ? Math.floor(index - this.inputs/2+1)-1 : Math.floor(index - this.inputs/2+1));

		if(BlockTypes[this.type].box != undefined && BlockTypes[this.type].box.in != undefined) {
			if(BlockTypes[this.type].box.in.u1 != undefined) u1 = BlockTypes[this.type].box.in.u1(box, iDelta);
			if(BlockTypes[this.type].box.in.v1 != undefined) v1 = BlockTypes[this.type].box.in.v1(box, iDelta);
			if(BlockTypes[this.type].box.in.u2 != undefined) u2 = BlockTypes[this.type].box.in.u2(box, iDelta);
			if(BlockTypes[this.type].box.in.v2 != undefined) v2 = BlockTypes[this.type].box.in.v2(box, iDelta);
		} else {
			// console.warn(`${BlockTypes[this.type].name} in box is not defined`);
		}
		return {x: this.transformX(u2,v2), y: this.transformY(u2,v2), srcX:this.transformX(u1,v1), srcY:this.transformY(u1,v1)};
	}

	transformX(u,v) {
		let angle = -this.angle*Math.PI/2;
		let cos = Math.cos(angle);
		let sin = Math.sin(angle);
		return cos*u - sin*v;
	}

	transformY(u,v) {
		let angle = -this.angle*Math.PI/2;
		let cos = Math.cos(angle);
		let sin = Math.sin(angle);
		return sin*u + cos*v;
	}
}

class Wire {

	constructor(props) {
		this.blocks = Vars.getBlocks();
		this.loopsStack = 0;
		this.repaint = () => {};
		for(let k of Object.keys(props)) {
			if(k == 'x' || k == 'y') {
				this.box[k] = props[k]*Vars.tilesize;
			}
			else this[k] = props[k];
		}
		if(this.preset) return;

		this.id = `wire${this.from}p${this.fromPort}to${this.to}p${this.toPort}`; 
		Vars.getLinks()[this.id] = this;

		this.addListeners();
		
	}

	update(updateId) {
		if(updateId == this.lastUpdate) {
			this.loopsStack++;
		}
		this.loopsStack = 0;
		this.lastUpdate = updateId;

		if(this.preset) return;

		let from  = Vars.getBlocks()[this.from];
		let to    = Vars.getBlocks()[this.to];
		if(to == undefined || from == undefined) {
			this.remove();
			return;
		}
		let pfrom = from.oPorts[this.toPort];
		let pto   = to.iPorts[this.fromPort];
		if(to.iPorts[this.toPort] == undefined) {
			this.remove();
			return;
		}
		if(from.oPorts[this.fromPort] == undefined) {
			this.remove();
			return;
		}
		to.iPorts[this.toPort].active = from.oPorts[this.fromPort].active;
		to.update(updateId);
		
		if(this.lastUpdateActive != from.oPorts[this.fromPort].active) {
			this.repaint();
			this.lastUpdateActive = from.oPorts[this.fromPort].active;
		}
	}
	

	addListeners() {
		if(this.blocks[this.from] != undefined && this.id != undefined) {
			this.blocks[this.from].listeners['linkUpdateTo' + this.id] = (uid) => {this.update(uid)};
		} else {
			console.warn("block is undefined");
		}
	}
	removeListeners() {
		if(Vars.getBlocks()[this.from] != undefined) Vars.getBlocks()[this.from].listeners['linkUpdateTo' + this.id] = undefined;
	}

	remove(rerender=true) {
		Vars.getLinks()[this.id] = undefined;
		this.removeListeners();
		if(rerender) Vars.renderScheme();
	}
	

	static decode(code, props) {
		let wire = {blocks: props.state.blocks};
		wire.from = Strings.decodeNumber(code, props);
		wire.to = Strings.decodeNumber(code, props);
		wire.fromPort = Strings.decodeNumber(code, props);
		wire.toPort = Strings.decodeNumber(code, props);
		return new Wire(wire);
	}


	encode(props) {
		let encoded = "";
		encoded += Strings.encodeNumber(this.from);
		encoded += Strings.encodeNumber(this.to);
		encoded += Strings.encodeNumber(this.fromPort);
		encoded += Strings.encodeNumber(this.toPort);
		return encoded;
	}
	

	setFrom(from, fromPort) {
		this.removeListeners();
		this.from = from;
		this.fromPort = fromPort;
		if(from != 'mouse') this.addListeners();
	}

	setTo(to, toPort) {
		this.removeListeners();
		this.to = to;
		this.toPort = toPort;
		if(to != 'mouse') this.addListeners();
	}
}


window.addEventListener('keydown', e => {
	if(Vars.selected.onKeyDown != undefined) Vars.selected.onKeyDown(e);
	if(e.ctrlKey) {
		if(e.code == 'KeyZ') {
			historyIndex--;
			if(historyIndex < 0) historyIndex = 0;
			state = history[historyIndex];
			console.log(historyIndex);
			Vars.$renderScheme();
		}
		if(e.code == 'KeyP') {
			Vars.export('svg');
			e.preventDefault();
		}
		if(e.code == 'KeyS') {
			let encoded = encodeState(Vars.getState());
			window.location.hash = '#' + encoded;
			console.log(encoded);
			e.preventDefault();
		}
		if(e.code == 'KeyO') {
			try {
				Vars.camera.x = 0;
				Vars.camera.y = 0;
				applyDecodedState(window.location.hash.substring(1));
				// let decoded = decodeState(window.location.hash.substring(1));
				// console.log("Decoded state", decoded);
				// if(decoded != undefined) {
				// 	state = decoded;
				// 	nextId = 0;
				// 	for (let b of Object.values(state.blocks)) {
				// 		nextId = Math.max(nextId, b.id);
				// 	}
				// 	nextId++;
				// 	Vars.$renderScheme();
				// 	console.log("Successfully opened!");
				// } else {
				// 	console.error("State not decoded");
				// }
			} catch (e) {
				console.log(e);
			}
			e.preventDefault();
		}
	}
});

window.addEventListener('unload', e => {
	localStorage.setItem('camera.x', Vars.camera.x);
	localStorage.setItem('camera.y', Vars.camera.y);
	localStorage.setItem('camera.scale', Vars.camera.scale);

	for (let fkey of Object.keys(frames)) {
		let f = Vars.frame(fkey);
		localStorage.setItem(`frame.${fkey}.x`, f.box.x);
		localStorage.setItem(`frame.${fkey}.y`, f.box.y);
		localStorage.setItem(`frame.${fkey}.w`, f.box.w);
		localStorage.setItem(`frame.${fkey}.h`, f.box.h);
		
	}
});

window.addEventListener('click', e => {
});

const onMouseDown = e => {
	Vars.mouse.clickTarget = e.target;
}

window.addEventListener('mousedown', e => onMouseDown(e));
window.addEventListener('touchstart', e => {
	onMouseDown(e);
	console.log("touchstart");
});


const onMouseMove = e => {
	Vars.mouse.client = {x: e.clientX, y: e.clientY};
	let pos = Vars.toSvgPoint(e);
	Vars.mouse.canvasPos = Vars.getSvgMousePos();
	if(e.buttons > 0 || e.mobile) {
		if(Vars.mouse.draggType == 'move-camera') {
			pos = {x: e.clientX, y: e.clientY};
			let x = Vars.mouse.draggBlockPos.x - (pos.x - Vars.mouse.draggStart.x)*Vars.camera.scale;
			let y = Vars.mouse.draggBlockPos.y - (pos.y - Vars.mouse.draggStart.y)*Vars.camera.scale;
			Vars.camera.x = x;
			Vars.camera.y = y;
			Vars.renderScheme();

			return;
		}
		if(Vars.mouse.draggType == 'move-block') { //Vars.mouse.draggBlock != undefined) {
			let x = Vars.mouse.draggBlockPos.x + pos.x - Vars.mouse.draggStart.x;
			let y = Vars.mouse.draggBlockPos.y + pos.y - Vars.mouse.draggStart.y;
			Vars.mouse.draggBlock.box.x = x;
			Vars.mouse.draggBlock.box.y = y;
			Vars.mouse.draggBlock.updatePorts();
			Vars.renderScheme();
			Vars.mouse.draggLastPos = pos;
			// TODO: event looses then block changes parent element
			if(!e.mobile) Vars.mouse.draggBlock.overlay = true;
		}
		if(Vars.mouse.draggType == 'create-wire') { //Vars.mouse.draggBlock != undefined) {
			// let x = Vars.mouse.draggBlockPos.x + pos.x - Vars.mouse.draggStart.x;
			// let y = Vars.mouse.draggBlockPos.y + pos.y - Vars.mouse.draggStart.y;    
			// Vars.mouse.draggBlock.box.x = x;
			// Vars.mouse.draggBlock.box.y = y;
			// Vars.mouse.draggBlock.updatePorts();
			Vars.renderScheme();
			// Vars.mouse.draggLastPos = pos;
			// Vars.mouse.draggBlock.overlay = true;
		}
		if(Vars.mouse.draggType == 'move-frame') {
			pos = {x: e.clientX, y: e.clientY};
			let x = Vars.mouse.draggBlockPos.x + (pos.x - Vars.mouse.draggStart.x);
			let y = Vars.mouse.draggBlockPos.y + (pos.y - Vars.mouse.draggStart.y);
			Vars.mouse.draggBlock.box.x = Math.min(Math.max(0, x), Vars.camera.width - Vars.mouse.draggBlock.box.w);
			Vars.mouse.draggBlock.box.y = Math.min(Math.max(0, y), Vars.camera.height - Vars.mouse.draggBlock.box.h);
			Vars.renderScheme();
		}
		if(Vars.mouse.draggType != undefined) {
			if(Vars.mouse.draggType.startsWith('resize-frame-')) {
				let type = Vars.mouse.draggType.substring('resize-frame-'.length);
				let down = type.indexOf('d') != -1;
				let top = type.indexOf('t') != -1;
				let right = type.indexOf('r') != -1;
				let left = type.indexOf('l') != -1;

				pos = {x: e.clientX, y: e.clientY};

				if(top) {
					let y = Vars.mouse.draggBlockPos.y + (pos.y - Vars.mouse.draggStart.y);
					let h = Vars.mouse.draggBlockPos.h - (pos.y - Vars.mouse.draggStart.y);
					h = Math.max(Vars.mouse.draggBlock.box.minh, h);
					Vars.mouse.draggBlock.box.h = h;
					Vars.mouse.draggBlock.box.y = Vars.mouse.draggBlockPos.y + Vars.mouse.draggBlockPos.h - h;
				}
				if(down) {
					let h = Vars.mouse.draggBlockPos.h + (pos.y - Vars.mouse.draggStart.y);
					Vars.mouse.draggBlock.box.h = Math.max(Vars.mouse.draggBlock.box.minh, h);
				}
				if(left) {
					let x = Vars.mouse.draggBlockPos.x + (pos.x - Vars.mouse.draggStart.x);
					let w = Vars.mouse.draggBlockPos.w - (pos.x - Vars.mouse.draggStart.x);
					w = Math.max(Vars.mouse.draggBlock.box.minw, w);
					Vars.mouse.draggBlock.box.w = w;
					Vars.mouse.draggBlock.box.x = Vars.mouse.draggBlockPos.x + Vars.mouse.draggBlockPos.w - w;
				}
				if(right) {
					let w = Vars.mouse.draggBlockPos.w + (pos.x - Vars.mouse.draggStart.x);
					Vars.mouse.draggBlock.box.w = Math.max(Vars.mouse.draggBlock.box.minw, w);
				}
				Vars.renderScheme();
			}
		}
	}
}
window.addEventListener('mousemove', e => {
	e.mobile = false;
	 onMouseMove(e);
});
window.addEventListener('touchmove', e => {
	e.mobile = true;
	e.clientX = e.touches[0].clientX;
	e.clientY = e.touches[0].clientY;
	onMouseMove(e);
});
window.addEventListener('touchcancel', e => {
	console.log('touchcancel', e);
});

const onMouseUp = e => {
	if(Vars.mouse.draggType == 'move-block') {
		let x = Vars.mouse.draggBlock.box.x;
		let y = Vars.mouse.draggBlock.box.y;
		x = Math.round(x/Vars.tilesize)*Vars.tilesize;
		y = Math.round(y/Vars.tilesize)*Vars.tilesize;
		Vars.mouse.draggBlock.overlay = false;
		Vars.mouse.draggBlock.box.x = x;
		Vars.mouse.draggBlock.box.y = y;

		for (let f of Object.values(frames)) {
			if(f.hasPoint(Vars.mouse.client)) {
				Vars.mouse.draggBlock.remove();
				break;
			}
		}

		Vars.renderScheme();
		Vars.mouse.draggBlock = undefined;
		Vars.mouse.draggStart = undefined;
	}
	if(Vars.mouse.draggType == 'move-frame') {
		
	}
	if(Vars.mouse.draggType == 'create-wire') {
		let l = Vars.wirePreset();
		if(l.from != undefined && l.from != 'mouse' && l.to != undefined && l.to != 'mouse') {
			let w = new Wire({from:l.from, to:l.to, fromPort:l.fromPort, toPort:l.toPort});
		}

	}
	
	Vars.wirePreset().from = undefined;
	Vars.wirePreset().to = undefined;

	Vars.mouse.draggType = undefined;
	Vars.mouse.draggStart = undefined;
	Vars.mouse.draggLastPos = undefined;
	Vars.mouse.draggBlockPos = undefined;

	if(Vars.mouse.clickTarget == Vars.schemeSvg()) {
		Vars.selected.target = undefined;
		Vars.selected.onKeyDown = undefined;
	}

	Vars.renderScheme();
};
window.addEventListener('mouseup', e => onMouseUp(e));
window.addEventListener('touchend', e => {
	e.mobile = true;
	e.clientX = e.changedTouches[0].clientX;
	e.clientY = e.changedTouches[0].clientY;
	onMouseUp(e);
});


window.addEventListener('resize', e => {
	Vars.camera.width = window.innerWidth;
	Vars.camera.height = window.innerHeight;
	Vars.renderScheme();
});


window.addEventListener('contextmenu', e => {
	e.preventDefault();
});

window.addEventListener("wheel", e => {
	if(e.ctrlKey) {
		const scrollPower = .03;
		let transform = (p) => {return {
			x: (p.x - window.innerWidth/2)*Vars.camera.scale,
			y: (p.y - window.innerHeight/2)*Vars.camera.scale,
		}};
		let src = transform(Vars.mouse.client == undefined ? {x:0,y:0} : Vars.mouse.client);//.x*Vars.camera.scale, y: Vars.mouse.client.y*Vars.camera.scale};
		if(e.deltaY > 0) {
			Vars.camera.scale += scrollPower;
		} else {
			if(Vars.camera.scale - scrollPower > 0) {
				Vars.camera.scale -= scrollPower;
			}
		}
		let result = transform(Vars.mouse.client == undefined ? {x:0,y:0} : Vars.mouse.client);//{x: Vars.mouse.client.x*Vars.camera.scale, y: Vars.mouse.client.y*Vars.camera.scale};
	
		Vars.camera.x += (src.x - result.x);///Vars.camera.scale;
		Vars.camera.y += (src.y - result.y);///Vars.camera.scale;
		Vars.renderScheme();
	}
});

document.getElementById('root').addEventListener('wheel', e => {
	e.preventDefault();
}, true);

new Block({preset: true, type: BlockTypes.all.switch, 	 name: "Switch", angle: 0});
new Block({preset: true, type: BlockTypes.all.not, 	 	 name: "Not", angle: 0});
new Block({preset: true, type: BlockTypes.all.and, 	 	 name: "And", angle: 0});
new Block({preset: true, type: BlockTypes.all.or, 	 	 name: "Or", angle: 0});
new Block({preset: true, type: BlockTypes.all.lamp, 	 name: "Lamp", angle: 0});
new Block({preset: true, type: BlockTypes.all.nand, 	 name: "NAnd", angle: 0});
new Block({preset: true, type: BlockTypes.all.nor, 	 	 name: "NOr", angle: 0});
new Block({preset: true, type: BlockTypes.all.xor, 	 	 name: "XOr", angle: 0});

// new Block({preset: true, hidden: true, type: Vars.blockTypes.node, 	 name: "Node", angle: 0});
wirePreset = new Wire({preset: true});

// new Block({type: "switch", x:0, y:0,		name: "00",  angle: 0});

let needExample = true;

if(window.location.hash.length > 1 && !window.location.hash.startsWith("#@")) {
	needExample = false;
	try {

		let decoded = applyDecodedState(window.location.hash.substring(1));//decodeState(window.location.hash.substring(1));
		// console.log("Decoded state", decoded);
		if(decoded == undefined) {
			needExample = true;
		} else {
			state = decoded;
		}
	} catch (e) {
		console.log(e);
		needExample = true;
	}
}

console.log("needExample", needExample);

if(needExample) {

	const createSum = (n) => {
		
		let as = [];
		let bs = [];
		let cs = [];

		let sums = [];
		for (var i = 0; i < n; i++) {
			let first = i == 0;
			let x = first ? 6 : i*4;
			let y = i*6;
			as.push(new Block({type: BlockTypes.all.switch,  x:-5, y:y+1, name: 'A' + (i+1)}));
		}
		
		for (var i = 0; i < n; i++) {
			let first = i == 0;

			let x = first ? 6 : i*4;
			let y = i*6;

			bs.push(new Block({type: BlockTypes.all.switch,  x:-3, y:y+3, name: 'B' + (i+1)}));
			cs.push(new Block({type: BlockTypes.all.lamp,  x:n*4+8, y:y+1, name: 'C' + (i+1)}));
			
			let sum = {};
			let lNor = new Block({type: first ? BlockTypes.all.xor : BlockTypes.all.xor,  x:x+3, y:y+2, name: 'NOR-L'});
			let rNor = first ? null : new Block({type: BlockTypes.all.xor,  x:x+8, y:y+1, name: 'NOR-R'});
			let lAnd  = new Block({type: BlockTypes.all.and,  x:x+3, y:y+3+2, name: 'AND-L'});
			let rAnd  = first ? null : new Block({type: BlockTypes.all.and,  x:x+7, y:y+4, name: 'AND-R'});
			let or = first ? null : new Block({type: BlockTypes.all.or,  x:x+9, y:y+5, name: 'OR'});

			let aNode = new Block({type: BlockTypes.all.node,  x:x+1, y:y+1, name: 'A'});
			let bNode = new Block({type: BlockTypes.all.node,  x:x, y:y+3, name: 'B'});
			let cNode = first ? null : new Block({type: BlockTypes.all.node,  x:x+6, y:y, name: 'C'});
			let tNode = first ? null : new Block({type: BlockTypes.all.node,  x:x+5, y:y+2, name: 'T'});

			
			sum.lNor = lNor; 
			sum.rNor = rNor; 
			sum.lAnd  = lAnd ; 
			sum.rAnd  = rAnd ; 

			new Wire({from:aNode.id, to:lNor.id, fromPort:0, toPort:1});
			new Wire({from:bNode.id, to:lNor.id, fromPort:0, toPort:0});
			new Wire({from:aNode.id, to:lAnd.id, fromPort:0, toPort:1});
			new Wire({from:bNode.id, to:lAnd.id, fromPort:0, toPort:0});
	
			
			if(!first) {
				new Wire({from:lNor.id, to:tNode.id, fromPort:0, toPort:0});
				new Wire({from:tNode.id, to:rNor.id, fromPort:0, toPort:0});
				new Wire({from:lAnd.id, to:or.id, fromPort:0, toPort:0});
				new Wire({from:rAnd.id, to:or.id, fromPort:0, toPort:1});

				new Wire({from:tNode.id, to:rAnd.id, fromPort:0, toPort:0});
				new Wire({from:cNode.id, to:rAnd.id, fromPort:0, toPort:1});
				new Wire({from:cNode.id, to:rNor.id, fromPort:0, toPort:1});
			}

			
			sum.a = (from) => {
				new Wire({from:from.id, to:aNode.id, fromPort:0, toPort:0});
				// new Wire({from:from.id, to:lAnd.id, fromPort:0, toPort:1});
			};
			sum.b = (from) => {
				new Wire({from:from.id, to:bNode.id, fromPort:0, toPort:0});
			};
			if(!first) sum.c = (from) => {
				new Wire({from:from.id, to:cNode.id, fromPort:0, toPort:0});
			};
			sum.s = first ? lNor : rNor;
			sum.p = first ? lAnd : or;
			sums.push(sum);
		}


		for (var i = 0; i < n-1; i++) {
			let first = i == 0;
			let f = sums[i];
			let t = sums[i+1];

			t.c(f.p);
		}

		for (var i = 0; i < n; i++) {
			sums[i].a(as[i]);
			sums[i].b(bs[i]);
			new Wire({from:sums[i].s.id, to:cs[i].id, fromPort:0, toPort:0});
		}


		let p = new Block({type: BlockTypes.all.lamp,  x:n*4+8, y:n*6, name: 'p'});
			new Wire({from:sums[n-1].p.id, to:p.id, fromPort:0, toPort:0});

	}


	if(window.location.hash.startsWith("#@adder")) {
		let n = parseInt(window.location.hash.substring("#@adder".length));
		if(!isNaN(n)) {
			console.log('secret code');
			needExample = false;
			createSum(n);
		}
	}

	if(needExample) {
		let $a  = new Block({type: BlockTypes.all.switch, x:-5, y:-2,  	name: "X1",  angle: 0});
		let $b  = new Block({type: BlockTypes.all.switch, x:-5, y:0,	name: "X2",  angle: 0});
		let $c  = new Block({type: BlockTypes.all.switch, x:-5, y:2,	name: "X3",  angle: 0});
		
		let $notb = new Block({type: BlockTypes.all.not,  x:-2, y:0, name: "not", angle: 0});
		new Wire({from:$b.id, to:$notb.id, fromPort:0, toPort:0});
		
		let $and1 = new Block({type: BlockTypes.all.and,    x:1, y:1, name: "and", angle: 0});
		new Wire({from:$notb.id, to:$and1.id, fromPort:0, toPort:1});
		new Wire({from:$c.id,    to:$and1.id, fromPort:0, toPort:0});
		
		let $and2 = new Block({type: BlockTypes.all.and,    x:4, y:-1, name: "and", angle: 0});
		new Wire({from:$a.id, 	 to:$and2.id, fromPort:0, toPort:1});
		new Wire({from:$notb.id, to:$and2.id, fromPort:0, toPort:0});
		
		
		let $and3 = new Block({type: BlockTypes.all.and,    x:2, y:4, name: "and", angle: 0});
		new Wire({from:$a.id, to:$and3.id, fromPort:0, toPort:1});
		new Wire({from:$c.id, to:$and3.id, fromPort:0, toPort:0});
		
		let $or  = new Block({type: BlockTypes.all.or, 	  x:8, y:1, name: "or",  angle: 0, inputs: 3});
		new Wire({from:$and1.id, to:$or.id, fromPort:0, toPort:1});
		new Wire({from:$and2.id, to:$or.id, fromPort:0, toPort:2});
		new Wire({from:$and3.id, to:$or.id, fromPort:0, toPort:0});
	
		let $lamp  = new Block({type: BlockTypes.all.lamp, 	  x:12, y:1, name: "F",  angle: 0});
		new Wire({from:$or.id, to:$lamp.id, fromPort:0, toPort:0});
	}

}


addToHistory();

// new Block({type: "switch", x:0, y:3, name: "x2", angle: 0});




// new Wire({from:$or.id, to:$and.id, fromPort:0, toPort:0});
// new Wire({from:$x3.id, to:$not.id, fromPort:0, toPort:0});
// new Wire({from:$not.id, to:$and.id, fromPort:0, toPort:1});



Vars.export = (format) => {
    let mainSvg = document.getElementById('main-svg');
    // console.log(mainSvg);
    // zone.maxX = Math.max(zone.maxX, EditorState.schemeNode.width());
    // console.log( zone.maxX, EditorState.schemeNode.width());
    // mainSvg.setAttribute("fill", "#000");
    // mainSvg.setAttribute("stroke", "#000");
    // mainSvg.setAttribute("font-family", "monospace");
    // mainSvg.setAttribute("viewBox", `${zone.minX} ${zone.minY} ${(zone.maxX-zone.minX)} ${(zone.maxY-zone.minY)}`);
    // canvas.current.setAttribute("fill", "#000");
    // canvas.current.setAttribute("stroke", "#000");
    // let oldGAttributes = [];
    // let groups = mainSvg.getElementsByTagName('g');
    // for (let g of groups) {
    //     oldGAttributes.push(g.getAttribute('stroke'));
    //     g.setAttribute("stroke", "#000");
    // }
    const saveFile = (url) => {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'scheme.' + format;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        // for (var i = 0; i < groups.length; i++) {
        //     groups[i].setAttribute("stroke", oldGAttributes[i]);
        // }
        // canvas.current.setAttribute("fill", "#fff");
        // canvas.current.setAttribute("stroke", "#7a7a7a");
        // mainSvg.setAttribute("fill", "#7a7a7a");
        // mainSvg.setAttribute("stroke", "#7a7a7a");
        // EditorState.repaint();
        // let scale = Math.max((zone.maxX-zone.minX) / width, (zone.maxY-zone.minY) / height);
        // mainSvg.setAttribute("viewBox", `${zone.minX} ${zone.minY} ${width*scale} ${height*scale}`);
    };
    
    if(format == 'svg') {
        saveFile(`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(mainSvg.outerHTML)))}`);
        return;
    }
};












export default Vars;