
import './Editor.css';
import BlockElement from './Block';
import WireElement from './Wire';
import Vars from '../Vars';
import Themes from '../Themes'
import {useState} from 'react'

function Editor() {
 	const [repaints, setRepaints] = useState(0);
	

	Vars.renderScheme = () => {
		setRepaints(() => repaints+1);
	};

	Vars.updateBlocks();




	let eBlocks = [];
	let bs = Vars.getBlocks();
	let ls = Vars.getLinks();
	for (let key of Object.keys(bs)) {
		let b = bs[key];
		eBlocks.push(<BlockElement key={`block${b.id}`} block={b} />); // uid={key} x={b.x} y={b.y} name={b.name} angle={b.angle == undefined ? 1 : b.angle}
	}

	let eWires = [];

	for (let key of Object.keys(ls)) {
		eWires.push(<WireElement key={key} link={ls[key]}/>);//<path stroke={pfrom.active ? "#fff" : "#333"} key={`wire${link.from}to${link.to}`} d={`M${pfrom.x},${pfrom.y} L${pto.x},${pto.y}`}/>);
	}

	let ePoints = [];

	for (var y = -10; y < 10; y++) {
		for (var x = -10; x < 10; x++) {
			ePoints.push(<circle key={`x${x}y${y}`} cx={x*Vars.tilesize} cy={y*Vars.tilesize} r="1"/>);
		}
	}



	return <div className="editor-box">
		
		<svg viewBox={`-95 -50 190 100`} xmlns="http://www.w3.org/2000/svg" id="main-svg" className="editor-box" fill="#7a7a7a">
			<defs>
				<linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stopColor="var(--power0)" />
					<stop offset="100%" stopColor="var(--power100)" />
				</linearGradient>
				<linearGradient id="path-gradient" spreadMethod="pad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-10">
					<stop offset="0%" stopColor="var(--power0)" />
					<stop offset="100%" stopColor="var(--power100)" />
				</linearGradient>
			</defs>
				<g fill="var(--background-accent)">
					{ePoints}
				</g>
				<g stroke="#fff">
					{eWires}
				</g>
				{eBlocks}

				{/*{dragged}*/}
				{/*<Block key={`key-1`} uid={-1} x={0} y={0} name={"b.name"}/>*/}
		</svg>
	</div>
}


export default Editor;