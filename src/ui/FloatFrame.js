
import Vars from '../Vars';
import './FloatFrame.css';

function FloatFrame(props) {
	let content = props.content == undefined ? () => [] : props.content;

	let frame = props.frame;
	
	let box = frame.box;

	return  <div className="floatframe" style={{left: `${box.x}px`, top: `${box.y}px`, width: `${box.w}px`, height: `${box.h}px`}}>
				<div className="framehead" onMouseDown={e => {
					let pos = {x:e.clientX, y:e.clientY};//Vars.toSvgPoint(e);
					console.log(e);
					Vars.mouse.draggType = 'move-frame';
					Vars.mouse.draggStart = pos;
					Vars.mouse.draggLastPos = pos;
					Vars.mouse.draggBlockPos = {x:frame.box.x, y:frame.box.y};
					Vars.mouse.draggBlock = frame;
				}}>{props.title}</div>
				<div className="content-box" style={{left: `${box.x}px`, top: `${box.y}px`, width: `${box.w}px`, height: `calc(${box.h}px - var(--frame-head-size))`}}>{content()}</div>
			</div>;
}



export default FloatFrame;