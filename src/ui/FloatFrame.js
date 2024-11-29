

import './FloatFrame.css';

function FloatFrame(props) {
	let content = props.content == undefined ? () => [] : props.content;
		
	return <div className="floatframe">{content()}</div>;
}



export default FloatFrame;