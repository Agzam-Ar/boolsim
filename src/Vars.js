
import Strings from './utils/Strings'

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
	blockTypes: {
		switch: 	0,
		and: 		1,
		or: 		2,
		not: 		3,
	},
	tilesize: 10,
	nodesize: .3,
	camera: {x:getLocalStorageItem('camera.x', 0), y:getLocalStorageItem('camera.y', 0), width: window.innerWidth, height: window.innerHeight, scale: getLocalStorageItem('camera.scale', 1/10)},
	mouse: {draggBlock: undefined, draggStart: undefined},
	selected: {},
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

	updateBlocks: () => {
		for (let b of Object.values(Vars.getBlocks())) {
			if(b != undefined) b.update();
		}
	},

	toSvgPoint(evt) {
		if(Vars.schemeSvg == undefined) return undefined;
		let svg = Vars.schemeSvg();
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
		this.box 		= {x:0,y:0,w:Vars.tilesize,h:Vars.tilesize, minw:0, minh:0};
		for(let k of Object.keys(props)) {
			if(k == 'x' || k == 'y' || k == 'w' || k == 'h' || k == 'minw' || k == 'minh') this.box[k] = props[k];
			else this[k] = props[k];
		}
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
	x:getLocalStorageItem('frame.blocks-pattle.x', 0),
	y:getLocalStorageItem('frame.blocks-pattle.y', 0), 
	w:getLocalStorageItem('frame.blocks-pattle.w', window.innerHeight*3/20),
	h:getLocalStorageItem('frame.blocks-pattle.h', window.innerHeight*10/20), 
	minw:window.innerHeight*3/40, 	minh:window.innerHeight*10/40});


window["Vars"] = Vars;

class Block {

	constructor(props) {
		this.overlay = false;
		if(props.preset == true) {
			this.id = `preset-${blocksPattle.length}`;
			blocksPattle.push(this);
			this.createBlock = () => {
				let pos = Vars.getSvgMousePos();
				let $props = Object.assign({}, props);
				$props.preset = undefined;
				$props.x = pos.x/Vars.tilesize;
				$props.y = pos.y/Vars.tilesize;
				console.log($props);
				return new Block($props);
			}
		} else {
			this.id = nextId++;
			if(props.preset != true) Vars.getBlocks()[this.id] = this;
		}
		this.box 		= {x:0,y:0,w:Vars.tilesize,h:Vars.tilesize};
	    this.type 		= Vars.blockTypes.switch;
	    this.active 	= false;
	    this.outputs = 1;
	    this.inputs  = 1;

	    if(props.preset == true) {
	    	this.box.x = 0;
	    	this.box.y = (blocksPattle.length-1)*20;
	    }

	    let type = props.type;
		if(type == Vars.blockTypes.switch) {
	    	this.outputs = 1;
	    	this.inputs  = 0;
		}
		if(type == Vars.blockTypes.or || type == Vars.blockTypes.and) {
	    	this.outputs = 1;
	    	this.inputs  = 2;
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

	update() {
		this.updatePorts();
		
		for (let l of Object.values(this.listeners)) {
			if(l != undefined) l();
		}
	}

	updatePorts() {
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


		if(this.type == Vars.blockTypes.switch) {
			for (var i = 0; i < this.oPorts.length; i++) {
				this.oPorts[i].active = this.active;
			}
		}
		if(this.type == Vars.blockTypes.or) {
			this.active = false;
			for (var i = 0; i < this.iPorts.length; i++) {
				if(!this.iPorts[i].active) continue;
				this.active = true;
				break;
			}
			for (var i = 0; i < this.oPorts.length; i++) {
				this.oPorts[i].active = this.active;
			}
		}
		if(this.type == Vars.blockTypes.and) {
			this.active = true;
			for (var i = 0; i < this.iPorts.length; i++) {
				if(this.iPorts[i].active) continue;
				this.active = false;
				break;
			}
			for (var i = 0; i < this.oPorts.length; i++) {
				this.oPorts[i].active = this.active;
			}
		}
		if(this.type == Vars.blockTypes.not && this.iPorts.length > 0) {
			this.active = !this.iPorts[0].active;
			for (var i = 0; i < this.oPorts.length; i++) {
				this.oPorts[i].active = this.active;
			}
		}
	}
	
	getOutputPos(index) {
		let type = this.type;
		let box = this.box;
		
		let u = 0;
		let v = 0;
		let su = Math.min(box.w, box.h)*.3;
		let sv = 0;

		if(this.type == Vars.blockTypes.switch) {
			u = 10;
			v = 0;
			su = Math.min(box.w, box.h)*.3;
			sv = 0;
		}
		if(this.type == Vars.blockTypes.not) {
			u = 10;
			v = 0;
			su = Math.min(box.w, box.h)*.5+2;
			sv = 0;
		}
		if(this.type == Vars.blockTypes.or || this.type == Vars.blockTypes.and) {
			u = 10;
			v = 0;
			su = Math.min(box.w, box.h)*.5;
			sv = 0;
		}
		
		return {x: this.transformX(u,v), y: this.transformY(u,v), srcX:this.transformX(su,sv), srcY:this.transformY(su,sv)};
	}

	getInputPos(index) {
		let type = this.type;
		let box = this.box;
		
		let u = -10;
		let v = 0;
		let su = -Math.min(box.w, box.h)*.3;
		let sv = 0;
		

		let iDelta = this.inputs%2 == 1 ? Math.floor(index - this.inputs/2+1) : (index < this.inputs/2 ? index+1 : -index-this.inputs/2+1);

		if(this.type == Vars.blockTypes.not) {
			u = -10;
			v = 0;
			su = -Math.min(box.w, box.h)*.5;
			sv = 0;
		}
		if(this.type == Vars.blockTypes.or || this.type == Vars.blockTypes.and) {
			u = -10;
			v = -iDelta*10;
			su = -Math.min(box.w, box.h)*.3+.5;
		}
		if(this.type == Vars.blockTypes.and) {
			su = -Math.min(box.w, box.h)*.5;
		}

		return {x: this.transformX(u,v), y: this.transformY(u,v), srcX:this.transformX(su,sv), srcY:this.transformY(su,sv)};
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
		for(let k of Object.keys(props)) {
			if(k == 'x' || k == 'y') {
				this.box[k] = props[k]*Vars.tilesize;
			}
			else this[k] = props[k];
		}
		if(this.preset) return;

		this.id = `wire${this.from}p${this.fromPort}to${this.to}p${this.toPort}`; 
		Vars.getLinks()[this.id] = this;

		if(this.blocks[this.from] != undefined) {
			this.blocks[this.from].listeners['linkUpdateTo' + this.id] = () => {this.update()};
		} else {
			console.warn("block is undefined");
		}
		
	}

	update() {
		if(this.preset) return;
		
		let from  = Vars.getBlocks()[this.from];
		let to    = Vars.getBlocks()[this.to];
		if(to == undefined || from == undefined) {
			this.remove();
			return;
		}
		let pfrom = from.oPorts[this.toPort];
		let pto   = to.iPorts[this.fromPort];
		to.iPorts[this.toPort].active = from.oPorts[this.fromPort].active;
		to.update();
	}

	remove() {
		Vars.getLinks()[this.id] = undefined;
		Vars.getBlocks()[this.from].listeners['linkUpdateTo' + this.id] = undefined;
		Vars.renderScheme();
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
		if(e.code == 'KeyS') {
			let encoded = encodeState(Vars.getState());
			window.location.hash = '#' + encoded;
			console.log(encoded);
			e.preventDefault();
		}
		if(e.code == 'KeyO') {
			try {
				let decoded = decodeState(window.location.hash.substring(1));
				console.log("Decoded state", decoded);
				if(decoded != undefined) {
					state = decoded;
					Vars.$renderScheme();
					console.log("Successfully opened!");
				} else {
					console.error("State not decoded");
				}
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

window.addEventListener('mousedown', e => {
});

window.addEventListener('mousemove', e => {
	Vars.mouse.client = {x: e.clientX, y: e.clientY};
	let pos = Vars.toSvgPoint(e);
	Vars.mouse.canvasPos = Vars.getSvgMousePos();//pos;
	if(e.buttons > 0) {
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
			Vars.mouse.draggBlock.overlay = true;
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
});

window.addEventListener('mouseup', e => {
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

	Vars.selected.target = undefined;
	Vars.selected.onKeyDown = undefined;

	Vars.renderScheme();
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
	const scrollPower = .03;
	let transform = (p) => {return {
		x: (p.x - window.innerWidth/2)*Vars.camera.scale,
		y: (p.y - window.innerHeight/2)*Vars.camera.scale,
	}};
	let src = transform(Vars.mouse.client);//.x*Vars.camera.scale, y: Vars.mouse.client.y*Vars.camera.scale};
	if(e.deltaY > 0) {
		Vars.camera.scale += scrollPower;
	} else {
		if(Vars.camera.scale - scrollPower > 0) {
			Vars.camera.scale -= scrollPower;
		}
	}
	let result = transform(Vars.mouse.client);//{x: Vars.mouse.client.x*Vars.camera.scale, y: Vars.mouse.client.y*Vars.camera.scale};

	Vars.camera.x += (src.x - result.x);///Vars.camera.scale;
	Vars.camera.y += (src.y - result.y);///Vars.camera.scale;
	Vars.renderScheme();
});

document.getElementById('root').addEventListener('wheel', e => {
	e.preventDefault();
}, true);

new Block({preset: true, type: Vars.blockTypes.switch, name: "Switch", angle: 0});
new Block({preset: true, type: Vars.blockTypes.not, 	 name: "Not", angle: 0});
new Block({preset: true, type: Vars.blockTypes.and, 	 name: "And", angle: 0});
new Block({preset: true, type: Vars.blockTypes.or, 	 name: "Or", angle: 0});
wirePreset = new Wire({preset: true});

// new Block({type: "switch", x:0, y:0,		name: "00",  angle: 0});

let needExample = true;

if(window.location.hash.length > 1) {
	// needExample = false;
	// try {
	// 	let decoded = decodeState(window.location.hash.substring(1));
	// 	console.log("Decoded state", decoded);
	// 	if(decoded == undefined) {
	// 		needExample = true;
	// 	} else {
	// 		state = decoded;
	// 	}
	// } catch (e) {
	// 	console.log(e);
	// 	needExample = true;
	// }
}


if(needExample) {
	let $a  = new Block({type: Vars.blockTypes.switch, x:-5, y:-2,  	name: "X1",  angle: 0});
	let $b  = new Block({type: Vars.blockTypes.switch, x:-5, y:0,		name: "X2",  angle: 0});
	let $c  = new Block({type: Vars.blockTypes.switch, x:-5, y:2,		name: "X3",  angle: 0});
	
	let $notb = new Block({type: Vars.blockTypes.not,  x:-2, y:0, name: "not", angle: 0});
	new Wire({from:$b.id, to:$notb.id, fromPort:0, toPort:0});
	
	let $and1 = new Block({type: Vars.blockTypes.and,    x:1, y:1, name: "and", angle: 0});
	new Wire({from:$notb.id, to:$and1.id, fromPort:0, toPort:0});
	new Wire({from:$c.id,    to:$and1.id, fromPort:0, toPort:1});
	
	let $and2 = new Block({type: Vars.blockTypes.and,    x:4, y:-1, name: "and", angle: 0});
	new Wire({from:$a.id, 	 to:$and2.id, fromPort:0, toPort:0});
	new Wire({from:$notb.id, to:$and2.id, fromPort:0, toPort:1});
	
	
	let $and3 = new Block({type: Vars.blockTypes.and,    x:2, y:3, name: "and", angle: 0});
	new Wire({from:$a.id, to:$and3.id, fromPort:0, toPort:0});
	new Wire({from:$c.id, to:$and3.id, fromPort:0, toPort:1});
	
	let $or  = new Block({type: Vars.blockTypes.or, 	  x:8, y:1, name: "or",  angle: 0, inputs: 3});
	new Wire({from:$and1.id, to:$or.id, fromPort:0, toPort:1});
	new Wire({from:$and2.id, to:$or.id, fromPort:0, toPort:2});
	new Wire({from:$and3.id, to:$or.id, fromPort:0, toPort:0});
}


addToHistory();

// new Block({type: "switch", x:0, y:3, name: "x2", angle: 0});




// new Wire({from:$or.id, to:$and.id, fromPort:0, toPort:0});
// new Wire({from:$x3.id, to:$not.id, fromPort:0, toPort:0});
// new Wire({from:$not.id, to:$and.id, fromPort:0, toPort:1});


export default Vars;