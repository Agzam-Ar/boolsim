import React from 'react'
import Vars from '../Vars';

class WireElement extends React.Component {
    
	constructor(props) {
		super(props);
		let bs = Vars.getBlocks();
		this.link = props.link;
		let link = this.link;
		this.from = bs[link.from];
		this.to = bs[link.to];
		
		this.state = {};

	    console.log('from', this.from);
	    const listener = () => {this.repaint()};
		this.from.listeners["link"] = listener;
	}


	repaint() {
		this.setState(() => {
			return this.state;
		});
	}

    render() {
		let link = this.link;
		let bs = Vars.getBlocks();

		let from = this.from;
		let to = this.to;
		if(from == undefined) return <path d={"M0,0"}/>;
		let pfrom = from.oPorts[link.fromPort];
		let pto = to.iPorts[link.toPort];

		pto.active = pfrom.active;
		

		let x1 = pfrom.x;
		let y1 = pfrom.y;
		let x2 = pto.x;
		let y2 = pto.y;


		let angle = Math.atan2(y2-y1,x2-x1);
		
		let cos = Math.cos(angle);
		let sin = Math.sin(angle);

		x1 += cos*Vars.nodesize;
		y1 += sin*Vars.nodesize;
		x2 -= cos*Vars.nodesize;
		y2 -= sin*Vars.nodesize;
		
        return (<g stroke={pfrom.active ? "#ff00aa" : "var(--unactive)"}>
        	<path d={`M${x1},${y1} L${x2},${y2}`}/>
        	<path className="bloor1" d={`M${x1},${y1} L${x2},${y2}`}/>
        	<path className="bloor2" d={`M${x1},${y1} L${x2},${y2}`}/>
        </g>);
    }

}

export default WireElement