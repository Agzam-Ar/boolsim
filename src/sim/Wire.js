import React from 'react'
import Vars from '../Vars';
import Themes from '../Themes'
import BlockTypes from '../logic/BlockTypes'

class WireElement extends React.Component {
    
	constructor(props) {
		super(props);
		
		this.id = props.id;
		
		this.state = {};

	}


	repaint() {
		this.setState(() => {
			return this.state;
		});
	}

    render() {
		let link = this.id == 'preset' ? Vars.wirePreset() : Vars.getLinks()[this.id];
		if(link == undefined) {
			return <path d={"M0,0"}/>;
		}
		let bs = Vars.getBlocks();

		let from = bs[link.from];
		let to = bs[link.to];

	    const listener = () => {this.repaint()};
	    link.repaint = listener;
		// if(from != undefined) from.listeners["linkTo" + link.to] = listener;

		// if(this.link.preset) {
		// 	console.log('Wire: ', link.from, link.fromPort);
		// }

		if(from == undefined && link.from != 'mouse') {
			link.remove(false);
			return <path d={"M0,0"}/>;
		}
		let pfrom = link.from == 'mouse' ? Vars.getSvgMousePos() : from.oPorts[link.fromPort];

		if(to == undefined && link.to != 'mouse') {
			link.remove(false);
			return <path d={"M0,0"}/>;
		}
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

		let gradientName = `wire-gradient-${link.from}-${link.to}`;
		

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

		let selected = Vars.selected.target == link;
		let border = Themes.theme.powerBorderSize * Themes.theme.powerSize;
		if(selected && border <= 0) {
			border = .2  * Themes.theme.powerSize;
		}

		if(!Vars.isSvgPointVisible(cx,cy, Math.abs(x1-x2), Math.abs(y1-y2))) return <g></g>;
		
        return (<g stroke={pfromActive ? "#ff00aa" : Themes.theme.unactive}>
        	<defs>
				<linearGradient id={gradientName} spreadMethod="pad" gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
					<stop offset="0%" stopColor={Themes.theme.power100} stopOpacity="1"></stop>
					<stop offset="50%" stopColor={Themes.theme.power0} stopOpacity="1"></stop>
					<stop offset="100%" stopColor={Themes.theme.power100} stopOpacity="1"></stop>
				</linearGradient>
        	</defs>
			{/*{<text className="label" x={cx} y={cy} stroke="none">{link.lastUpdate+""}</text>}*/}
        	<g fill="none" className={Themes.theme.mixBlend} stroke={pfromActive ? `url(#${gradientName})` : Themes.theme.unactive}  onClick={e => {
        			if(link.preset) return;

        			if(Vars.selected.target == link) {
        				let pos = Vars.getSvgMousePos();
        				console.log("link:", link);
        				let block = Vars.createBlock({type: BlockTypes.all.node, x:Math.round(pos.x/Vars.tilesize), y:Math.round(pos.y/Vars.tilesize),  	name: "",  angle: 0});
        				console.log("block:", block);
        				let link1 = Vars.createLink({from: link.from, to:block.id, fromPort:link.fromPort, toPort:0});
        				let link2 = Vars.createLink({from: block.id, to:link.to, fromPort:0, toPort:link.toPort});
        				link.remove();
						
						Vars.renderScheme();
        				return;
        			}
					Vars.selected.target = link;

					Vars.selected.onKeyDown = e => {
						if(e.code == 'Delete') {
							link.remove();
						}
					};
					console.log("Down");
					Vars.renderScheme();
        		}}>
        		{selected ? <circle strokeWidth={border+1} stroke={Themes.theme.selectColor} fill={Themes.theme.selectColor} cx={x1} cy={y1} r={Themes.theme.nodeSize}></circle> : undefined}
        		{selected ? <circle strokeWidth={border+1} stroke={Themes.theme.selectColor} fill={Themes.theme.selectColor} cx={x2} cy={y2} r={Themes.theme.nodeSize}></circle> : undefined}
        		{selected ? <path strokeWidth={border+1} stroke={Themes.theme.selectColor} d={d}/> : []}
        		{border > 0 ? <path strokeWidth={border} stroke={Themes.theme.powerBorderColor} d={d}/> : (<g></g>)}
        		<path d={d}/>
        		{glow ? <path className="bloor1 no-events" d={d}/> : (<g></g>)}
        		{glow ? <path className="bloor2 no-events" d={d}/> : (<g></g>)}
        	</g>
        </g>);
    }

}

export default WireElement