

let nextId = 0;
let blocks = {};

let links = [];

let Vars = {
	tilesize: 10,
	nodesize: .3,
	mouse: {draggBlock: undefined, draggStart: undefined},
	getBlocks: () => blocks,
	getLinks: () => links,
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
	    pt.x = evt.clientX;
	    pt.y = evt.clientY;
	    return pt.matrixTransform(svg.getScreenCTM().inverse());
	}
};

window["Vars"] = Vars;

class Block {

	constructor(props) {
		this.id = nextId++;
		this.box 		= {x:0,y:0,w:Vars.tilesize,h:Vars.tilesize};
	    this.type 		= 'switch';
	    this.active 	= false;
	    this.outputs = 1;
	    this.inputs  = 1;

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


		blocks[this.id] = this;

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
		links[`wire${this.from}to${this.to}`] = this;

		blocks[this.from].listeners['linkUpdateTo' + this.to] = () => {this.update()};
	}

	update() {
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
	let pos = Vars.toSvgPoint(e);
	if(e.buttons > 0) {
		if(Vars.mouse.draggBlock != undefined) {
			
			// Vars.mouse.draggBlock.box.dragX += pos.x - Vars.mouse.draggLastPos.x;
			// Vars.mouse.draggBlock.box.dragY += pos.y - Vars.mouse.draggLastPos.y;
			let x = Vars.mouse.draggBlockPos.x + pos.x - Vars.mouse.draggStart.x;
			let y = Vars.mouse.draggBlockPos.y + pos.y - Vars.mouse.draggStart.y;
			Vars.mouse.draggBlock.box.x = x;//Math.round(x/Vars.tilesize)*Vars.tilesize;
			Vars.mouse.draggBlock.box.y = y;// Math.round(y/Vars.tilesize)*Vars.tilesize;


			Vars.mouse.draggBlock.updatePorts();
			// Vars.mouse.draggBlock.render();
			Vars.renderScheme();

			Vars.mouse.draggLastPos = pos;
		console.log("drawg");
		}
	}
});
window.addEventListener('mouseup', e => {
	if(Vars.mouse.draggBlock != undefined) {
		let x = Vars.mouse.draggBlock.box.x;
		let y = Vars.mouse.draggBlock.box.y;
		x = Math.round(x/Vars.tilesize)*Vars.tilesize;
		y = Math.round(y/Vars.tilesize)*Vars.tilesize;
		Vars.mouse.draggBlock.box.x = x;
		Vars.mouse.draggBlock.box.y = y;
			Vars.renderScheme();
		console.log("reset pos", x, y);

		Vars.mouse.draggBlock = undefined;
		Vars.mouse.draggStart = undefined;
	}
});


let $a  = new Block({type: "switch", x:-5, y:-2,  	name: "X1",  angle: 0});
let $b  = new Block({type: "switch", x:-5, y:0,		name: "X2",  angle: 0});
let $c  = new Block({type: "switch", x:-5, y:2,		name: "X3",  angle: 0});

let $notb = new Block({type: "not",  x:-2, y:0, name: "not", angle: 0});
new Wire({from:$b.id, to:$notb.id, fromPort:0, toPort:0});

// (!b & c) || (a & !b) || (a & c)

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