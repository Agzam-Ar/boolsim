
import React from 'react'
import Vars from '../Vars';

class BlockElement extends React.Component {
    

	constructor(props) {
		super(props);
		this.block = props.block;
		
		this.state = {};
		for(let k of Object.keys(this.block)) {
			this.state[k] = this.block[k];
		}

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
	    console.log('listeners', this.block.listeners);
	    const listener = () => {this.repaint()};
		this.block.listeners["element"] = listener;
	}

	repaint() {
		this.setState(() => {
			return this.state;
		});
	}

    render() {
		let box = this.block.box;
	
		let eOutputs = [];

		let block = this.block;
		for (var i = 0; i < this.block.oPorts.length; i++) {
			let port = this.block.oPorts[i];
			eOutputs.push(this.createOutput('o' + i, port));
		}

		for (var i = 0; i < this.block.iPorts.length; i++) {
			let port = this.block.iPorts[i];
			eOutputs.push(this.createOutput('i' + i, port));
		}

		// return <rect width={box.w} height="100" />;
        return (<g x={box.x} y={box.y} transform={`translate(${box.x} ${box.y})`}> 
			<g transform={`rotate(${this.block.angle*90} 0 0)`}>{this.getBody()}</g>
			<g transform={`rotate(${this.block.angle*90} 0 0)`} className="bloor1">{this.getBody()}</g>
			<g transform={`rotate(${this.block.angle*90} 0 0)`} className="bloor2">{this.getBody()}</g>
			{eOutputs}
			{<text className="label">{this.block.name}</text>}
			{/*<rect stroke="#f00" x={box.w/-2} y={box.h/-2} width={box.w} height={box.h}></rect>*/}
        </g>);
    }

	createOutput(key, config) {
		let size = config.size == undefined ? Vars.nodesize : config.size;
		// if(key.charAt(0) == 'i') console.log('active input', config.active);
		
		let x1 = config.drawSrcX;
		let y1 = config.drawSrcY;
		let x2 = config.dx;
		let y2 = config.dy;

		let angle = Math.atan2(y2-y1,x2-x1);
		let cos = Math.cos(angle);
		let sin = Math.sin(angle);

		x2 -= cos*size;
		y2 -= sin*size;
		

		let gradientName = `gradient-block-${this.block.id}-${x1}-${y1}-${x2}-${y2}`;

		return <g key={key} >

        	<defs>
				<linearGradient id={gradientName} spreadMethod="pad" gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
					<stop offset="0%" stopColor="var(--power50)" stopOpacity="1"></stop>
					<stop offset="100%" stopColor="#00FFF1" stopOpacity="1"></stop>
				</linearGradient>
        	</defs>

			<path className="light" d={`M${x1},${y1} L${x2},${y2}`} stroke={config.active ? `url(#${gradientName})` : "var(--unactive)"} strokeLinecap="butt" strokeLinejoin="miter"></path>
			<path className="bloor1" d={`M${x1},${y1} L${x2},${y2}`} stroke={config.active ? `url(#${gradientName})` : "var(--unactive)"} strokeLinecap="butt" strokeLinejoin="miter" fillOpacity="0" strokeMiterlimit="4" strokeOpacity="1"></path>
			<path className="bloor2" d={`M${x1},${y1} L${x2},${y2}`} stroke={config.active ? `url(#${gradientName})` : "var(--unactive)"} strokeLinecap="butt" strokeLinejoin="miter" fillOpacity="0" strokeMiterlimit="4" strokeOpacity="1"></path>
			<circle stroke={config.active ? "var(--power100)" : "var(--unactive)"} fill="var(--unactive)" cx={config.dx} cy={config.dy} r={size}></circle>
			<circle className="bloor1" stroke={config.active ? "var(--power100)" : "none"} fill="none" cx={config.dx} cy={config.dy} r={size}></circle>
			<circle className="bloor2" stroke={config.active ? "var(--power100)" : "none"} fill="none" cx={config.dx} cy={config.dy} r={size}></circle>
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

		if(type == 'switch') return <g stroke={this.block.active ? "url(#gradient)" : "transparent"}>
			{/*<rect stroke="var(--unactive)" x={- box.w/2} y={- box.h/2} width={box.w} height={box.h}></rect>*/}
			<rect stroke="var(--unactive)" x={left*.9} y={top*.9} width={box.w*.9} height={box.h*.9}></rect>
			{/*<g className="bloor1">
			<rect stroke="var(--unactive)" x={left*.9} y={box.h/-2*.9} width={box.w*.9} height={box.h*.9}></rect>
				<circle  fill="#00000000"r={Math.min(box.w, box.h)*.4}></circle>
				<circle stroke={this.block.active ? "url(#gradient)" : "transparent"} fill="#00000000"r={Math.min(box.w, box.h)*.3}></circle>
			</g>
			<g className="bloor2" stroke={this.block.active ? "url(#gradient)" : "transparent"}>
			<rect stroke="var(--unactive)" x={left*.9} y={box.h/-2*.9} width={box.w*.9} height={box.h*.9}></rect>
				<circle fill="#00000000" r={Math.min(box.w, box.h)*.4}></circle>
				<circle stroke={this.block.active ? "url(#gradient)" : "transparent"} fill="#00000000" r={Math.min(box.w, box.h)*.3}></circle>
			</g>*/}
			<circle className="clickable" stroke={this.block.active ? "url(#gradient)" : "var(--unactive)"} fill="var(--unactive)" r={Math.min(box.w, box.h)*.3} onClick={() => {
				this.block.active = !this.block.active;
				this.block.update();
				// this.repaint();
			}}></circle>
		</g>;


		if(type == 'or') return <g stroke={this.block.active ? "url(#gradient)" : "var(--unactive)"}>
			<path d={`M${left/2},0 Q${left/2},${top/2},${left},${top} Q${right},${top},${right},${0} Q${right},${bottom},${left},${bottom} Q${left/2} ${bottom/2} ${left/2} ${0}`}></path>
			{/*<g className="bloor1">
				<path d={`M${left/2},0 Q${left/2},${top/2},${left},${top} Q${right},${top},${right},${0} Q${right},${bottom},${left},${bottom} Q${left/2} ${bottom/2} ${left/2} ${0}`}></path>
			</g>
			<g className="bloor2" stroke={this.block.active ? "url(#gradient)" : "transparent"}>
				<path d={`M${left/2},0 Q${left/2},${top/2},${left},${top} Q${right},${top},${right},${0} Q${right},${bottom},${left},${bottom} Q${left/2} ${bottom/2} ${left/2} ${0}`}></path>
			</g>*/}
		</g>;

		// A rx ry x-axis-rotation large-arc-flag sweep-flag x y
		if(type == 'and') return <g stroke={this.block.active ? "url(#gradient)" : "var(--unactive)"}>
			<path d={`M${left},${top} L${0},${top}, A ${.1} ${.1} 0 0 1 ${0} ${bottom} L${left} ${bottom} Z`}></path>
			{/*<path className="bloor1" d={`M${left},${top} L${0},${top}, A ${.1} ${.1} 0 0 1 ${0} ${bottom} L${left} ${bottom} Z`}></path>*/}
			{/*<path className="bloor2" d={`M${left},${top} L${0},${top}, A ${.1} ${.1} 0 0 1 ${0} ${bottom} L${left} ${bottom} Z`}></path>*/}
		</g>;

		if(type == 'not') return <g stroke={this.block.active ? "url(#gradient)" : "var(--unactive)"}>
			<path d={`M${left},${top/2} L${right-2},${0} L${left} ${bottom/2} Z`}></path>
			<circle cx={right} fill="#00000000" r={2}></circle>
			{/*<path className="bloor1" d={`M${left},${top/2} L${right-2},${0} L${left} ${bottom/2} Z`}></path>*/}
			{/*<path className="bloor2" d={`M${left},${top/2} L${right-2},${0} L${left} ${bottom/2} Z`}></path>*/}
		</g>;

		if(type == 'xor') return <g stroke={this.block.active ? "url(#gradient)" : "var(--unactive)"}>
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