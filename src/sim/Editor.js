
import './Editor.css';
import BlockElement from './Block';
import WireElement from './Wire';
import Vars from '../Vars';
import Themes from '../Themes'
import FloatFrame from '../ui/FloatFrame';
import {useState, useRef} from 'react'
import { FaPlay } from "react-icons/fa6";

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
	let eWiresOverlay = [<WireElement key={"preset"} id={"preset"}/>];

	for (let key of Object.keys(ls)) {
		if(ls[key] == undefined) continue;
		eWires.push(<WireElement key={key} id={key}/>); // link={ls[key]}
	}


	let ePoints = [];

	let viewBoxX = Vars.camera.x - (Vars.camera.width/2)*Vars.camera.scale;
	let viewBoxY = Vars.camera.y - (Vars.camera.height/2)*Vars.camera.scale;

	let viewBoxW = Vars.camera.width*Vars.camera.scale;
	let viewBoxH = Vars.camera.height*Vars.camera.scale;
	
	if(Vars.camera.scale < .5)
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
			<FloatFrame frame={Vars.frame("blocks-pattle")} title="Blocks pattle" content={() => {
				let eBlocks = [];
				let bs = Vars.getBlocksPattle();
				for (let b of bs) {
					eBlocks.push(<BlockElement key={`block${b.id}`} block={b} />); // uid={key} x={b.x} y={b.y} name={b.name} angle={b.angle == undefined ? 1 : b.angle}
				}
				let frame = Vars.frame("blocks-pattle");
				let w = 30;
				let h = 120;
				let raito = `${frame.box.w} / ${frame.box.h}`;
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

			<FloatFrame frame={Vars.frame("blocks-inspector")} title="Inspector" content={() => {
				if(Vars.selected.target == undefined) return undefined;
				let eElements = [];
				let target = Vars.selected.target;
				let type = target.classType;


				if(type == 'Block') {
					let keys = {
						name: {
							name: "Name",
							type: "string",
						},
						inputs: {
							name: "Number of inputs",
							type: "int",
							min: 0,
							max: 10,
						},
						angle: {
							name: "Angle",
							type: "select",
							variants: [
								{name: "Right", value: 0},
								{name: "Top", value: 1},
								{name: "Left", value: 2},
								{name: "Down", value: 3},
							],
						},
					};
					for (let key of Object.keys(keys)) {
						let config = keys[key];
						eElements.push(<label key={"label-" + key} htmlFor="" >{config.name}</label>);
						if(config.type == 'string') {
							eElements.push(<input key={'input-' + key} key={key + "-input"} type="text" value={target[key]} onChange={e => {
								target[key] = e.target.value;
								Vars.renderScheme();
							}}/>);
						}
						if(config.type == 'int') {
							eElements.push(<input key={'input-' + key} key={key + "-input"} type="number" min={config.min} max={config.max} value={target[key+"tmp"] == undefined ? target[key] : target[key+"tmp"]} onChange={e => {
								let value = e.target.value;
								target[key+"tmp"] = value;
								if(config.min <= value && value < config.max) {
									target[key] = value;
								}
								Vars.renderScheme();
							}}/>);
						}
						if(config.type == 'select') {
							eElements.push(<select key={'select-' + key} value={target[key]} onChange={e => {
								target[key] = e.target.value;
								Vars.renderScheme();
							}}>{config.variants.map(e => <option key={e.value} value={e.value}>{e.name}</option>)}</select>);
						}
					}
				}
				return <div className="inspector-box">
							{eElements}
							
							{/*<label htmlFor="">Input ports</label><input type="number"/>*/}
						</div>;
			}}/>


			<FloatFrame frame={Vars.frame("truth-table")} title="Truth table" content={() => {
				let frame = Vars.frame("truth-table");
				if(frame["truth-table"] == undefined) frame["truth-table"] = {};
				let truthtable = frame["truth-table"];
				let head = [];
				let inputs = [];
				let outputs = [];
				let idsPull = [];
				for (let block of Object.values(Vars.getBlocks())) {
					if(block == undefined) continue;
					if(block.name == "") continue;
					if(block.type == Vars.blockTypes.switch) {
						inputs.push(block);
						head.push({
							name: block.name,
							type: "i",
						});
						idsPull.push("" + block.id);
					}
				}
				for (let block of Object.values(Vars.getBlocks())) {
					if(block == undefined) continue;
					if(block.name == "") continue;
					if(block.type == Vars.blockTypes.lamp) {
						outputs.push(block);
						head.push({
							name: block.name,
							type: "o",
						});
						idsPull.push("" + block.id);
					}
				}
				
				const addStateToTable = () => {
					let currentTableKey = "";
					let currentRow = {};
					for (let b of inputs) {
						currentTableKey += "_" + b.id + "-" + (b.active?'0':'1');
						currentRow[b.id] = b.active;
					}
					currentTableKey += "_o";
					for (let b of outputs) {
						currentTableKey += "_" + b.id + "-" + (b.active?'0':'1');
						currentRow[b.id] = b.active;
					}
					truthtable[currentTableKey] = currentRow;
					return currentTableKey;
				}

				let currentTableKey = addStateToTable();
				
				let rows = [];
				for (let rawRowKey of Object.keys(truthtable)) {
					let rawRow = truthtable[rawRowKey];
					let valid = true;
					let same = 0;
					for (let colRawKey of Object.keys(rawRow)) {
						if(idsPull.includes(colRawKey)) {
							same++;
							continue;
						}
						valid = false;
						break;
					}
					let sortKeys = 0;
					for (var i = 0; i < inputs.length; i++) {
						if(rawRow[inputs[inputs.length-i-1].id]) {
							sortKeys += 1 << i;
						}
					}

					let cols = [<th className="truth-table-body b" key="select"><button onClick={e => {
						for (let b of inputs) b.active = rawRow[b.id];
								Vars.renderScheme();
					}}><FaPlay/></button></th>];
					if(rawRowKey == currentTableKey) {
						for (let b of inputs) cols.push(<th className="truth-table-body i" key={b.id}>{rawRow[b.id] ? "1" : "0"}</th>);
						for (let b of outputs) cols.push(<th className="truth-table-body o" key={b.id}>{rawRow[b.id] ? "1" : "0"}</th>);
						rows.push({sort: sortKeys, e: <tr key={rawRowKey}>{cols}</tr>});
					} else if((valid && same == idsPull.length) || rawRowKey == currentTableKey) {
						for (let b of inputs) cols.push(<td className="truth-table-body i" key={b.id}>{rawRow[b.id] ? "1" : "0"}</td>);
						for (let b of outputs) cols.push(<td className="truth-table-body o" key={b.id}>{rawRow[b.id] ? "1" : "0"}</td>);
						rows.push({sort: sortKeys, e: <tr key={rawRowKey}>{cols}</tr>});
					}
				}
				rows.sort((r1,r2) => r1.sort-r2.sort);
				console.log(rows);
				return <div className="truth-table-box">
							<table>
								<thead>
								<tr>
									<th className="truth-table-head b"></th>
									{head.map((e,id) => <th className={"truth-table-head " + e.type} key={id}>{e.name}</th>)}
								</tr>
								</thead>
								<tbody>
									{rows.map((e,id) => e.e)}
								</tbody>
							</table>
							<button onClick={e => {
								let index = 0;
								for (var s = 0; s < 1 << inputs.length; s++) {
									for (var i = 0; i < inputs.length; i++) {
										inputs[i].active = ((1 << i) & s) == 0;
									}
									Vars.updateBlocks();
									addStateToTable();
								}
								Vars.renderScheme();
							}}>Generate</button>
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