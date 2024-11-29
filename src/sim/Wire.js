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
		if(this.from != undefined) this.from.listeners["linkTo" + link.to] = listener;
	}


	repaint() {
		this.setState(() => {
			return this.state;
		});
	}

    render() {
		let link = this.link;
		let bs = Vars.getBlocks();

		this.from = bs[link.from];
		this.to = bs[link.to];

		let from = this.from;
		let to = this.to;

		// if(this.link.preset) {
		// 	console.log('Wire: ', link.from, link.fromPort);
		// }

		if(from == undefined && link.from != 'mouse') return <path d={"M0,0"}/>;
		let pfrom = link.from == 'mouse' ? Vars.getSvgMousePos() : from.oPorts[link.fromPort];

		if(to == undefined && link.to != 'mouse') return <path d={"M0,0"}/>;
		let pto = link.to == 'mouse' ? Vars.getSvgMousePos() : to.iPorts[link.toPort];

		pto.active = pfrom == undefined ? false : pfrom.active;
		
		let x1 = pfrom == undefined ? 0 : pfrom.x;
		let y1 = pfrom == undefined ? 0 : pfrom.y;
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
		

		let cx = (x1+x2)/2;
		let cy = (y1+y2)/2;

		let h = x2 > x1;//Math.abs(x1-x2) < Math.abs(y1-y2);
		// let xt = Math.abs(x1-x2)/Math.abs(y1-y2);

		let d = `M${x1},${y1} L${x2},${y2}`;

		if(x2 > x1) {
			d = `M${x1},${y1} Q${x1},${y2} ${x2},${y2}`;
		} else {
			d = `M${x1},${y1} Q${x2},${y1} ${x2},${y2}`;
		}


		// d = `M${x1},${y1} S${x1},${y2} ${cx},${cy} S${x2},${cy} ${x2},${y2}`;

		// d = `M${x1},${y1}  Q${h ? cx : x1},${h ? y1 : cy} ${cx},${cy} T${x2},${y2}`;


		// d = `M${x1},${y1}  Q${h ? cx : x1},${h ? y1 : cy} ${cx},${cy} T${x2},${y2}`;

		let pfromActive = (pfrom != undefined && pfrom.active);
		let glow = pfromActive && Themes.theme.glow;
		let border = Themes.theme.powerBorderSize * Themes.theme.powerSize;
		
        return (<g class="no-events" stroke={pfromActive ? "#ff00aa" : "var(--unactive)"}>
        	<defs>
				<linearGradient id={gradientName} spreadMethod="pad" gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
					<stop offset="0%" stopColor="var(--power100)" stopOpacity="1"></stop>
					<stop offset="50%" stopColor="var(--power0)" stopOpacity="1"></stop>
					<stop offset="100%" stopColor="var(--power100)" stopOpacity="1"></stop>
				</linearGradient>
        	</defs>
        	<g className={Themes.theme.mixBlend} stroke={pfromActive ? `url(#${gradientName})` : "var(--unactive)"} >
        		{border > 0 ? <path strokeWidth={border} stroke="var(--power-border-color)" d={d}/> : (<g></g>)}
        		<path d={d}/>
        		{glow ? <path className="bloor1" d={d}/> : (<g></g>)}
        		{glow ? <path className="bloor2" d={d}/> : (<g></g>)}
        	</g>
        </g>);
    }

}

export default WireElement