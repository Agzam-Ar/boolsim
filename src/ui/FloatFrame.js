
import Vars from '../Vars';
import Events from '../utils/Events';
import './FloatFrame.css';
import {useState, useRef} from 'react'

function FloatFrame(props) {
 	const [repaints, setRepaints] = useState(0);

	let content = props.content == undefined ? () => [] : props.content;

	let frame = props.frame;
	
	frame.render = () => {
		setRepaints(() => repaints+1);
	};

	let box = frame.box;

	const resize = (e, type) => {
		let pos = {x:e.clientX, y:e.clientY};
		Vars.mouse.draggType = 'resize-frame-' + type;
		console.log(Vars.mouse.draggType);
		Vars.mouse.draggStart = pos;
		Vars.mouse.draggLastPos = pos;
		Vars.mouse.draggBlockPos = {x:frame.box.x, y:frame.box.y,w:frame.box.w,h:frame.box.h};
		Vars.mouse.draggBlock = frame;
	};

	let x = box.x;
	if(box.x + box.w > window.innerWidth) x  = window.innerWidth - box.w;
	
	let $content = content();

	if(frame.visible == false) return undefined;
	return <div className="floatframe" style={{left: `${x}px`, top: `${box.y}px`, width: `${box.w}px`, height: `${box.h}px`}}>
				<div className="frame-resize-hbox t">
					<div className="frame-resize corner tl" onMouseDown={e => resize(e, 'tl')} onTouchStart={e => Events.toMouse(e, e=>resize(e, 'tl'))}></div>
					<div className="frame-resize hline t"   onMouseDown={e => resize(e, 't')}  onTouchStart={e => Events.toMouse(e, e=>resize(e, 't' ))}></div>
					<div className="frame-resize corner tr" onMouseDown={e => resize(e, 'tr')} onTouchStart={e => Events.toMouse(e, e=>resize(e, 'tr'))}></div>
				</div>
				<div className="frame-hbox">
					<div className="frame-resize-vbox l">
						<div className="frame-resize vline l" onMouseDown={e => resize(e, 'l')}></div>
					</div>
					<div className="frame-box">
						<div className="framehead" onMouseDown={e => {
							let pos = {x:e.clientX, y:e.clientY};//Vars.toSvgPoint(e);
							console.log(e);
							Vars.mouse.draggType = 'move-frame';
							Vars.mouse.draggStart = pos;
							Vars.mouse.draggLastPos = pos;
							Vars.mouse.draggBlockPos = {x:x, y:frame.box.y};
							Vars.mouse.draggBlock = frame;
						}} onTouchStart={e => {
							e.clientX = e.targetTouches[0].clientX;
							e.clientY = e.targetTouches[0].clientY;
							let pos = {x:e.clientX, y:e.clientY};//Vars.toSvgPoint(e);
							console.log(e);
							Vars.mouse.draggType = 'move-frame';
							Vars.mouse.draggStart = pos;
							Vars.mouse.draggLastPos = pos;
							Vars.mouse.draggBlockPos = {x:x, y:frame.box.y};
							Vars.mouse.draggBlock = frame;
						}}>{props.title}</div>
						<div className="content-box" style={{left: `${x}px`, top: `${box.y}px`, width: `${box.w}px`, height: `calc(${box.h}px - var(--frame-head-size))`}}>{$content}</div>
					</div>
					<div className="frame-resize-vbox r">
						<div className="frame-resize vline r" onMouseDown={e => resize(e, 'r')}></div>
					</div>
				</div>
				<div className="frame-resize-hbox b">
					<div className="frame-resize corner dl" onMouseDown={e => resize(e, 'dl')} onTouchStart={e => Events.toMouse(e, e=>resize(e, 'dl'))}></div>
					<div className="frame-resize hline d"   onMouseDown={e => resize(e, 'd')}  onTouchStart={e => Events.toMouse(e, e=>resize(e, 'd' ))}></div>
					<div className="frame-resize corner dr" onMouseDown={e => resize(e, 'dr')} onTouchStart={e => Events.toMouse(e, e=>resize(e, 'dr'))}></div>
				</div>
			</div>;
}



export default FloatFrame;