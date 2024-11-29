import React from 'react'
import Vars from '../Vars';
import Themes from '../Themes'

class WireElement extends React.Component {
    
	constructor(props) {
		super(props);
		let bs = Vars.getBlocks();
		this.link = props.link;
		let link = this.link;
		this.from = bs[link.from];
		this.to = bs[link.to];
		
		this.state = {};

	    const listener = () => {this.repaint()};
		this.from.listeners["linkTo" + link.to] = listener;
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

		// x1 += cos*Vars.nodesize;
		// y1 += sin*Vars.nodesize;
		// x2 -= cos*Vars.nodesize;
		// y2 -= sin*Vars.nodesize;

		let gradientName = `wire-gradient-${this.link.from}-${this.link.to}`;
		

		// let cx = (x1+x2)/2;
		// let cy = (y1+y2)/2;

		let d = `M${x1},${y1} L${x2},${y2}`;
		d = `M${x1},${y1} Q${x1},${y2} ${x2},${y2}`;
		// d = `M${x1},${y1} S${x1},${cy} ${cx},${cy} S${x2},${cy} ${x2},${y2}`;


		let glow = pfrom.active && Themes.theme.glow;
		let border = Themes.theme.powerBorderSize * Themes.theme.powerSize;
		
        return (<g class="no-events" stroke={pfrom.active ? "#ff00aa" : "var(--unactive)"}>
        	<defs>
				<linearGradient id={gradientName} spreadMethod="pad" gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
					<stop offset="0%" stopColor="var(--power100)" stopOpacity="1"></stop>
					<stop offset="50%" stopColor="var(--power0)" stopOpacity="1"></stop>
					<stop offset="100%" stopColor="var(--power100)" stopOpacity="1"></stop>
				</linearGradient>
        	</defs>
        	<g className={Themes.theme.mixBlend} stroke={pfrom.active ? `url(#${gradientName})` : "var(--unactive)"} >
        		{border > 0 ? <path strokeWidth={border} stroke="var(--power-border-color)" d={d}/> : (<g></g>)}
        		<path d={d}/>
        		{glow ? <path className="bloor1" d={d}/> : (<g></g>)}
        		{glow ? <path className="bloor2" d={d}/> : (<g></g>)}
        	</g>
        </g>);
    }

}

export default WireElement