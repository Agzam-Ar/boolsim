

let nextId = 0;
let blocks = {};
let blocksPattle = [];

let links = [];


let wirePreset;

let Vars = {
	tilesize: 10,
	nodesize: .3,
	camera: {x:0, y:0, width: window.innerWidth, height: window.innerHeight, scale: 1/10},
	mouse: {draggBlock: undefined, draggStart: undefined},
	getBlocks: () => blocks,
	getLinks: () => links,
	wirePreset: () => wirePreset,

	getBlocksPattle: () => blocksPattle,
	renderScheme: () => {},

	updateBlocks: () => {
		for (let b of Object.values(blocks)) {
			b.update();
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
};

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
			if(props.preset != true) blocks[this.id] = this;
		}
		this.box 		= {x:0,y:0,w:Vars.tilesize,h:Vars.tilesize};
	    this.type 		= 'switch';
	    this.active 	= false;
	    this.outputs = 1;
	    this.inputs  = 1;

	    if(props.preset == true) {
	    	this.box.x = 0;
	    	this.box.y = (blocksPattle.length-1)*20;
	    }

	    let type = props.type;
		if(type == 'switch') {
	    	this.outputs = 1;
	    	this.inputs  = 0;
		}
		if(type == 'or' || type == 'and') {
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
	

	render() {
		if(this.elementListener != undefined) this.elementListener();
	}

	update() {
		this.updatePorts();
		
		for (let l of Object.values(this.listeners)) {
			l();
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


		if(this.type == 'switch') {
			for (var i = 0; i < this.oPorts.length; i++) {
				this.oPorts[i].active = this.active;
			}
		}
		if(this.type == 'or') {
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
		if(this.type == 'and') {
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
		if(this.type == 'not' && this.iPorts.length > 0) {
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

		if(this.type == 'switch') {
			u = 10;
			v = 0;
			su = Math.min(box.w, box.h)*.3;
			sv = 0;
		}
		if(this.type == 'not') {
			u = 10;
			v = 0;
			su = Math.min(box.w, box.h)*.5+2;
			sv = 0;
		}
		if(this.type == 'or' || this.type == 'and') {
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

		if(this.type == 'not') {
			u = -10;
			v = 0;
			su = -Math.min(box.w, box.h)*.5;
			sv = 0;
		}
		if(this.type == 'or' || this.type == 'and') {
			u = -10;
			v = -iDelta*10;
			su = -Math.min(box.w, box.h)*.3+.5;
		}
		if(this.type == 'and') {
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
		for(let k of Object.keys(props)) {
			if(k == 'x' || k == 'y') {
				this.box[k] = props[k]*Vars.tilesize;
			}
			else this[k] = props[k];
		}
		if(this.preset) return;
		links[`wire${this.from}p${this.fromPort}to${this.to}p${this.toPort}`] = this;

		blocks[this.from].listeners['linkUpdateTo' + this.to] = () => {this.update()};
	}

	update() {
		if(this.preset) return;

		let from  = blocks[this.from];
		let to    = blocks[this.to];
		let pfrom = from.oPorts[this.toPort];
		let pto   = to.iPorts[this.fromPort];
		to.iPorts[this.toPort].active = from.oPorts[this.fromPort].active;
		to.update();
	}
}

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
	}
});

window.addEventListener('mouseup', e => {
	if(Vars.mouse.draggBlock != undefined) {
		let x = Vars.mouse.draggBlock.box.x;
		let y = Vars.mouse.draggBlock.box.y;
		x = Math.round(x/Vars.tilesize)*Vars.tilesize;
		y = Math.round(y/Vars.tilesize)*Vars.tilesize;
		Vars.mouse.draggBlock.overlay = false;
		Vars.mouse.draggBlock.box.x = x;
		Vars.mouse.draggBlock.box.y = y;
			Vars.renderScheme();
		console.log("reset pos", x, y);

		Vars.mouse.draggBlock = undefined;
		Vars.mouse.draggStart = undefined;
	}
	if(Vars.mouse.draggType == 'create-wire') {
		let l = Vars.wirePreset();
		console.log("Preset result", Object.assign({}, l));
		if(l.from != undefined && l.from != 'mouse' && l.to != undefined && l.to != 'mouse') {

			let w = new Wire({from:l.from, to:l.to, fromPort:l.fromPort, toPort:l.toPort});
		}

		Vars.wirePreset().from = undefined;
		Vars.wirePreset().to = undefined;
	}
	

	Vars.mouse.draggType = undefined;
	Vars.mouse.draggStart = undefined;
	Vars.mouse.draggLastPos = undefined;
	Vars.mouse.draggBlockPos = undefined;
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

new Block({preset: true, type: "switch", name: "Switch", angle: 0});
new Block({preset: true, type: "not", 	 name: "Not", angle: 0});
new Block({preset: true, type: "and", 	 name: "And", angle: 0});
new Block({preset: true, type: "or", 	 name: "Or", angle: 0});
wirePreset = new Wire({preset: true});

// new Block({type: "switch", x:0, y:0,		name: "00",  angle: 0});

let $a  = new Block({type: "switch", x:-5, y:-2,  	name: "X1",  angle: 0});
let $b  = new Block({type: "switch", x:-5, y:0,		name: "X2",  angle: 0});
let $c  = new Block({type: "switch", x:-5, y:2,		name: "X3",  angle: 0});

let $notb = new Block({type: "not",  x:-2, y:0, name: "not", angle: 0});
new Wire({from:$b.id, to:$notb.id, fromPort:0, toPort:0});

let $and1 = new Block({type: "and",    x:1, y:1, name: "and", angle: 0});
new Wire({from:$notb.id, to:$and1.id, fromPort:0, toPort:0});
new Wire({from:$c.id,    to:$and1.id, fromPort:0, toPort:1});

let $and2 = new Block({type: "and",    x:4, y:-1, name: "and", angle: 0});
new Wire({from:$a.id, 	 to:$and2.id, fromPort:0, toPort:0});
new Wire({from:$notb.id, to:$and2.id, fromPort:0, toPort:1});


let $and3 = new Block({type: "and",    x:2, y:3, name: "and", angle: 0});
new Wire({from:$a.id, to:$and3.id, fromPort:0, toPort:0});
new Wire({from:$c.id, to:$and3.id, fromPort:0, toPort:1});

let $or  = new Block({type: "or", 	  x:8, y:1, name: "or",  angle: 0, inputs: 3});
new Wire({from:$and1.id, to:$or.id, fromPort:0, toPort:1});
new Wire({from:$and2.id, to:$or.id, fromPort:0, toPort:2});
new Wire({from:$and3.id, to:$or.id, fromPort:0, toPort:0});


// new Block({type: "switch", x:0, y:3, name: "x2", angle: 0});




// new Wire({from:$or.id, to:$and.id, fromPort:0, toPort:0});
// new Wire({from:$x3.id, to:$not.id, fromPort:0, toPort:0});
// new Wire({from:$not.id, to:$and.id, fromPort:0, toPort:1});


export default Vars;