

import './FloatFrame.css';

function FloatFrame(props) {
	let content = props.content == undefined ? () => [] : props.content;

	let frame = props.frame;
	
	let box = frame.box;

	return  <div className="floatframe" style={{left: `${box.x}px`, top: `${box.y}px`, width: `${box.w}px`, height: `${box.h}px`}}>
				<div className="framehead"></div>
				<div className="content-box" style={{left: `${box.x}px`, top: `${box.y}px`, width: `${box.w}px`, height: `calc(${box.h}px - var(--frame-head-size))`}}>{content()}</div>
			</div>;
}



export default FloatFrame;