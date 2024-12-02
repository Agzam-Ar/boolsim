
import React from 'react'
import Vars from '../Vars';
import Themes from '../Themes'

class BlockElement extends React.Component {
    

	constructor(props) {
		super(props);
		this.state = {};
		if(props.id == undefined) {
			this.block = props.block;
			this.preset = true;
		} else {
			this.id = props.id;
			this.block = Vars.getBlocks()[this.id];
			this.preset = false;
		}

		// console.log("Id:",this.id);
    	// this.block = Vars.getBlocks()[this.id];

		// for(let k of Object.keys(this.block)) {
		// 	this.state[k] = this.block[k];
		// }

		// this.id = props.uid;
		// this.state = {
		// 	id: props.uid,
	    // 	box: {x: parseInt(props.x) | 0, y: parseInt(props.y) | 0, w: 10, h: 10},
	    // 	type: 'switch',
	    // 	active: false,
	    // 	outputs: 1,
	    // 	angle: props.angle,
	    // 	name: props.name,
	    // };
	}

	repaint() {
		this.setState(() => {
			return this.state;
		});
	}

    render() {
    	if(!this.preset) this.block = Vars.getBlocks()[this.id];

	    const listener = () => {this.repaint()};
		this.block.listeners["element"] = listener;
		this.block.elementListener = listener;

		let box = this.block.box;
	
		let eOutputs = [];
		let eOutputsSelected = [];
		let selected = Vars.selected.target == this.block;

		let block = this.block;
		for (var i = 0; i < this.block.oPorts.length; i++) {
			let port = this.block.oPorts[i];
			eOutputs.push(this.createPort('o', i, port));
			if(selected) eOutputsSelected.push(this.createPort('o', i, port, true));
		}

		for (var i = 0; i < this.block.iPorts.length; i++) {
			let port = this.block.iPorts[i];
			eOutputs.push(this.createPort('i', i, port));
			if(selected) eOutputsSelected.push(this.createPort('i', i, port, true));
		}

		let glow = this.block.active && Themes.theme.glow;
		let border = Themes.theme.powerBorderSize * Themes.theme.powerSize;
		
		let body = this.getBody();

		if(selected && border <= 0) {
			border = .2  * Themes.theme.powerSize;
		}
		// return <rect width={box.w} height="100" />;
        return (<g x={box.x} y={box.y} stroke={this.block.active ? "url(#gradient)" : "var(--unactive)"} transform={`translate(${box.x} ${box.y})`}> 
			<rect onClick={e => {
        			if(this.block.preset) return;
					Vars.selected.target = this.block;

					Vars.selected.onKeyDown = e => {
						if(e.code == 'Delete') {
							this.block.remove();
						}
					};
					console.log("Down");
					Vars.renderScheme();
        		}}
			onTouchStart={e => {
				e.clientX = e.targetTouches[0].clientX;
				e.clientY = e.targetTouches[0].clientY;
				let block = this.block;

				let pos = Vars.toSvgPoint(e);

				if(this.block.preset) {
        			block = this.block.createBlock();
        			pos = Vars.getSvgMousePos();
				}
				Vars.mouse.draggType = 'move-block';
				Vars.mouse.draggStart = pos;
				Vars.mouse.draggLastPos = pos;
				Vars.mouse.draggBlockPos = {x:block.box.x, y:block.box.y};
				Vars.mouse.draggBlock = block;
				// console.log("Type", pos);
			}}
        	onMouseDown={e => {
				let block = this.block;

				let pos = Vars.toSvgPoint(e);

				if(this.block.preset) {
        			console.log("down preset");
        			block = this.block.createBlock();
        			pos = Vars.getSvgMousePos();
				}
				Vars.mouse.draggType = 'move-block';
				Vars.mouse.draggStart = pos;
				Vars.mouse.draggLastPos = pos;
				Vars.mouse.draggBlockPos = {x:block.box.x, y:block.box.y};
				Vars.mouse.draggBlock = block;
			}} class="element-box" strokeWidth={border} fill="transparent" x={box.w/-2} y={box.h/-2} width={box.w} height={box.h}></rect>
			
			{eOutputsSelected}
			{selected ? <g className="no-events" strokeWidth={border+1} stroke={Themes.theme.selectColor} transform={`rotate(${this.block.angle*-90} 0 0)`}>
				{this.getBody()}
			</g> : []}
			{eOutputs}
			{border > 0 ? <g strokeWidth={border} stroke="var(--power-border-color)" fill="var(--power-border-color)" transform={`rotate(${this.block.angle*-90} 0 0)`}>{body}</g> : []}
			<g fill="var(--func-color)"transform={`rotate(${this.block.angle*-90} 0 0)`}>{body}</g>
			{glow ? <g transform={`rotate(${this.block.angle*-90} 0 0)`} className="bloor1">{this.getBody()}</g> : []}
			{glow ? <g transform={`rotate(${this.block.angle*-90} 0 0)`} className="bloor2">{this.getBody()}</g> : []}
			{<text className="label" stroke="none">{this.block.name}</text>}
			{/*{<text y="8" className="label" stroke="none">#{this.block.id}</text>}*/}
        </g>);
    }

	createPort(type, portId, config, selected=false) {
		let glow = config.active && Themes.theme.glow;
		let border = Themes.theme.powerBorderSize * Themes.theme.powerSize;

		let size = config.size == undefined ? Vars.nodesize : config.size;
		
		let x1 = config.drawSrcX;
		let y1 = config.drawSrcY;
		let x2 = config.dx;
		let y2 = config.dy;

		let angle = Math.atan2(y2-y1,x2-x1);
		let cos = Math.cos(angle);
		let sin = Math.sin(angle);

		x2 -= cos*size;
		y2 -= sin*size;
		

		let box = this.block.box;
		let gradientName = `gradient-block-${this.block.id}-${x1}-${y1}-${x2}-${y2}`;
		let d = `M${x1},${y1} L${x2},${y2}`;
		
		if(selected && border <= 0) {
			border = .2  * Themes.theme.powerSize;
		}

		return <g key={type + portId} >
        	<defs>
				<linearGradient id={gradientName} spreadMethod="pad" gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
					<stop offset="0%" stopColor="var(--power50)" stopOpacity="1"></stop>
					<stop offset="100%" stopColor="var(--power100)" stopOpacity="1"></stop>
				</linearGradient>
        	</defs>
        	<g class="no-events" >
				{selected ? <path className="no-events" d={d} strokeWidth={border+1} stroke={Themes.theme.selectColor} strokeLinecap="round" strokeLinejoin="miter"></path> : undefined}
				
				{border > 0 ? <path className={Themes.theme.mixBlend} d={d} strokeWidth={border} stroke="var(--power-border-color)" strokeLinecap="round" strokeLinejoin="miter"></path> : undefined}
	
				<path className="light" d={d} stroke={config.active ? `url(#${gradientName})` : "var(--unactive)"} strokeLinecap="round" strokeLinejoin="miter"></path>
				{glow ? <path className="bloor1" d={d} stroke={config.active ? `url(#${gradientName})` : "var(--unactive)"} strokeLinecap="butt" strokeLinejoin="miter" fillOpacity="0" strokeMiterlimit="4" strokeOpacity="1"></path> : <g></g>}
				{glow ? <path className="bloor2" d={d} stroke={config.active ? `url(#${gradientName})` : "var(--unactive)"} strokeLinecap="butt" strokeLinejoin="miter" fillOpacity="0" strokeMiterlimit="4" strokeOpacity="1"></path> : <g></g>}
				{selected ? <circle strokeWidth={border+1} stroke={Themes.theme.selectColor} fill={Themes.theme.selectColor} cx={config.dx} cy={config.dy} r={size}></circle> : undefined}
				{border > 0 ? <circle strokeWidth={border} stroke="var(--power-border-color)" fill="var(--power-border-color)" cx={config.dx} cy={config.dy} r={size}></circle> : undefined}
				<circle stroke={config.active ? "var(--power100)" : "var(--unactive)"} fill="var(--unactive)" cx={config.dx} cy={config.dy} r={size}></circle>
				{glow ? <circle className="bloor1" stroke={config.active ? "var(--power100)" : "none"} fill="none" cx={config.dx} cy={config.dy} r={size}></circle> : undefined}
				{glow ? <circle className="bloor2" stroke={config.active ? "var(--power100)" : "none"} fill="none" cx={config.dx} cy={config.dy} r={size}></circle> : undefined}
			</g>
			<circle stroke="transparent" fill="transparent" strokeWidth={border} cx={config.dx} cy={config.dy} r={size} onMouseEnter={e => {
				if(this.block.preset) return;
				// TODO
				let wire = Vars.wirePreset();

				if(type == 'o') {
					if(wire.from == 'mouse') {
						wire.from = this.block.id;
						wire.fromPort = portId;
					}
				}
				if(type == 'i') {
					if(wire.to == 'mouse') {
						wire.to = this.block.id;
						wire.toPort = portId;
					}
				}
			}} onMouseLeave={e => {
				if(this.block.preset) return;
				let wire = Vars.wirePreset();
				if(this.block.id == wire.src) return;

				if(type == 'o') {
					if(wire.from == this.block.id) {
						wire.from = 'mouse';
						wire.fromPort = 0;
					}
				}
				if(type == 'i') {
					if(wire.to == this.block.id) {
						wire.to = 'mouse';
						wire.toPort = 0;
					}
				}

			}} onMouseDown={e => {
				if(this.block.preset) return;
				let wire = Vars.wirePreset();
				wire.src = this.block.id;
				
				if(type == 'o') {
					wire.from = this.block.id;
					wire.fromPort = portId;
					wire.to = 'mouse';
					wire.toPort = 0;
				}
				if(type == 'i') {
					wire.to = this.block.id;
					wire.toPort = portId;
					wire.from = 'mouse';
					wire.fromPort = 0;
				}

				Vars.renderScheme();

				let block = this.block;

				let pos = Vars.toSvgPoint(e);

				// if(this.block.preset) {
        		// 	console.log("down preset");
        		// 	block = this.block.createBlock();
        		// 	pos = Vars.getSvgMousePos();
				// }

				Vars.mouse.draggType = 'create-wire';
				Vars.mouse.draggStart = pos;
				Vars.mouse.draggLastPos = pos;
				Vars.mouse.draggBlockPos = {x:block.box.x, y:block.box.y};
				Vars.mouse.draggBlock = block;
			}}></circle>
		</g>;
	}

	getBody() {
		let type = this.block.type;
		let box = this.block.box;
		if(box == undefined) return <g></g>;
		
		let left = box.w/-2;
		let top = box.h/-2;
		let right = box.w/2;
		let bottom = box.h/2;

		let glow = this.block.active && Themes.theme.glow;
		let border = Themes.theme.powerBorderSize * Themes.theme.powerSize;

		if(type == Vars.blockTypes.switch) return <g>
			<rect class="no-events" x={left} y={top} width={box.w} height={box.h}></rect>
			<circle stroke={this.block.active ? "inherit" : "var(--func-accent)"} className={this.block.preset ? "no-events" : "clickable"} r={Math.min(box.w, box.h)*.25} onClick={() => {
				if(this.block.preset) return;
				this.block.setActive(!this.block.active);
				// this.block.update();
			}}></circle>
		</g>;

		if(type == Vars.blockTypes.lamp) return <g>
			<circle class="no-events" fill={this.block.active ? "url(#gradient)" : "inherit"} r={Math.min(box.w, box.h)/2}></circle>
			{/*<circle stroke={this.block.active ? "inherit" : "var(--func-accent)"} className={this.block.preset ? "no-events" : "clickable"} r={Math.min(box.w, box.h)*.25}></circle>*/}
		</g>;


		if(type == Vars.blockTypes.or) {
			let k = 2/3;
			return <path class="no-events" d={`M${left*k},0 Q${left*k},${top/2},${left},${top} Q${right/2},${top},${right},${0} Q${right/2},${bottom},${left},${bottom} Q${left*k} ${bottom/2} ${left*k} ${0}`}></path>;
		}
		if(type == Vars.blockTypes.and) return <path class="no-events" d={`M${left},${top} L${0},${top}, A ${.1} ${.1} 0 0 1 ${0} ${bottom} L${left} ${bottom} Z`}></path>;

		if(type == Vars.blockTypes.not) return <g>
			<path class="no-events"  d={`M${left},${top/2} L${right-2-border},${0} L${left} ${bottom/2} Z`}></path>
			<circle class="no-events" cx={right} fill="#00000000" r={2}></circle>
		</g>;

		if(type == Vars.blockTypes.xor) return <g class="no-events" stroke={this.block.active ? "url(#gradient)" : "var(--unactive)"}>
			{/*<rect stroke="var(--unactive)" x={- box.w/2} y={- box.h/2} width={box.w} height={box.h}></rect>*/}
			<path d={`M${left/2+1},0 Q${left/2+1},${top/2},${left+1},${top} Q${right},${top},${right},${0} Q${right},${bottom},${left+1},${bottom} Q${left/2+1} ${bottom/2} ${left/2+1} ${0}`}></path>
			<path d={`M${left},${top} Q${left/2},${top/2},${left/2},${0}  Q${left/2},${bottom/2} ${left} ${bottom}`}></path>
			{/*<rect stroke="var(--unactive)" x={box.w/-2*.9} y={box.h/-2*.9} width={box.w*.9} height={box.h*.9}></rect>
			<g className="bloor1">
			<rect stroke="var(--unactive)" x={box.w/-2*.9} y={box.h/-2*.9} width={box.w*.9} height={box.h*.9}></rect>
				<circle  fill="#00000000"r={Math.min(box.w, box.h)*.4}></circle>
				<circle stroke={this.block.active ? "url(#gradient)" : "transparent"} fill="#00000000"r={Math.min(box.w, box.h)*.3}></circle>
			</g>
			<g className="bloor2" stroke={this.block.active ? "url(#gradient)" : "transparent"}>
			<rect stroke="var(--unactive)" x={box.w/-2*.9} y={box.h/-2*.9} width={box.w*.9} height={box.h*.9}></rect>
				<circle fill="#00000000" r={Math.min(box.w, box.h)*.4}></circle>
				<circle stroke={this.block.active ? "url(#gradient)" : "transparent"} fill="#00000000" r={Math.min(box.w, box.h)*.3}></circle>
			</g>
			<circle className="clickable" stroke={this.block.active ? "url(#gradient)" : "var(--unactive)"} fill="var(--unactive)" r={Math.min(box.w, box.h)*.3} onClick={() => {
				this.block.active = !this.block.active;
				this.block.update();
				// this.repaint();
			}}></circle>*/}
		</g>;
	}

	getHtmlBox() {
		
	}
}

class Block {



}




export default BlockElement;
export {Block};