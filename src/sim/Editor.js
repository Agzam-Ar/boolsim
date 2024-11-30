
import './Editor.css';
import BlockElement from './Block';
import WireElement from './Wire';
import Vars from '../Vars';
import Themes from '../Themes'
import FloatFrame from '../ui/FloatFrame';
import {useState, useRef} from 'react'

function Editor() {
 	const [repaints, setRepaints] = useState(0);
  	const ref = useRef(null);
  	Vars.schemeSvg = () => ref.current;

	Vars.$renderScheme = () => {
		setRepaints(() => repaints+1);
	};

	Vars.updateBlocks();




	let eBlocks = [];
	let eBlocksOverlay = [];
	let bs = Vars.getBlocks();
	let ls = Vars.getLinks();
	for (let key of Object.keys(bs)) {
		let b = bs[key];
		if(b == undefined) continue;
		let eBlock = <BlockElement key={`block${b.id}`} id={b.id} />;
		if(b.overlay) eBlocksOverlay.push(eBlock);
		else eBlocks.push(eBlock);
	}

	let eWires = [];
	let eWiresOverlay = [<WireElement key={"preset"} link={Vars.wirePreset()}/>];

	for (let key of Object.keys(ls)) {
		if(ls[key] == undefined) continue;
		eWires.push(<WireElement key={key} link={ls[key]}/>);
	}


	let ePoints = [];

	let viewBoxX = Vars.camera.x - (Vars.camera.width/2)*Vars.camera.scale;
	let viewBoxY = Vars.camera.y - (Vars.camera.height/2)*Vars.camera.scale;

	let viewBoxW = Vars.camera.width*Vars.camera.scale;
	let viewBoxH = Vars.camera.height*Vars.camera.scale;

	for (var y = Math.floor(viewBoxY/Vars.tilesize); y <= Math.ceil((viewBoxY+viewBoxH)/Vars.tilesize); y++) {
		for (var x = Math.floor(viewBoxX/Vars.tilesize); x < Math.ceil((viewBoxX+viewBoxW)/Vars.tilesize); x++) {
			ePoints.push(<circle key={`x${x}y${y}`} cx={x*Vars.tilesize} cy={y*Vars.tilesize} r="1"/>);
		}
	}

	return <div className="editor-box">
		
		<svg onMouseDown={e => {
			if(e.target != ref.current) return;
			if(e.button == 1 || e.button == 2) {
				let pos = Vars.toSvgPoint(e);
				pos = {x: e.clientX, y: e.clientY};
				Vars.mouse.draggType = "move-camera";
				Vars.mouse.draggStart = pos;
				Vars.mouse.draggBlockPos = {x:Vars.camera.x, y:Vars.camera.y};
				Vars.mouse.draggLastPos = pos;
			}
		}} ref={ref} style={{
			aspectRatio: `${Vars.camera.width}/${Vars.camera.height}`,
		}} viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxW} ${viewBoxH}`} xmlns="http://www.w3.org/2000/svg" id="main-svg" className="editor-box" fill="#7a7a7a">
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
				<g fill="var(--background-accent)" className="no-events">
					{ePoints}
				</g>
				<g stroke="#fff">
					{eWires}
				</g>
				{eBlocks}
		</svg>

		<div>
			<FloatFrame frame={Vars.frame("blocks-pattle")} content={() => {
				let eBlocks = [];
				let bs = Vars.getBlocksPattle();
				for (let b of bs) {
					eBlocks.push(<BlockElement key={`block${b.id}`} block={b} />); // uid={key} x={b.x} y={b.y} name={b.name} angle={b.angle == undefined ? 1 : b.angle}
				}
				// let ePoints = [];
			
				// for (var y = -10; y < 10; y++) {
				// 	for (var x = -10; x < 10; x++) {
				// 		ePoints.push(<circle key={`x${x}y${y}`} cx={x*Vars.tilesize} cy={y*Vars.tilesize} r="1"/>);
				// 	}
				// }
				let w = 30;
				let h = 200;
				let raito = `${w} / ${h}`;
				return <div className="block-pattle-box" style={{aspectRatio: raito}}>
					<svg className="block-pattle" style={{aspectRatio: raito}} viewBox={`${w/-2} ${w/-2} ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" id="main-svg" fill="#7a7a7a">
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
						<g fill="var(--background-accent)" className="no-events">
							{/*{ePoints}*/}
						</g>
							{eBlocks}
					</svg>
				</div>;		
			}}/>
		</div>

		<svg style={{aspectRatio: `${Vars.camera.width}/${Vars.camera.height}`}} viewBox={`${viewBoxX} ${viewBoxY} ${Vars.camera.width*Vars.camera.scale} ${Vars.camera.height*Vars.camera.scale}`} xmlns="http://www.w3.org/2000/svg" id="main-svg" className="editor-box-overlay" fill="#7a7a7a">
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
				<g stroke="#fff">
					{eWiresOverlay}
				</g>
				{eBlocksOverlay}
		</svg>
	</div>
}


export default Editor;