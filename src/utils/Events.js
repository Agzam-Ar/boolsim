

const Events = {

	toMouse: (e, listener) => {
		console.log(e);
		e.mobile = true;
		e.clientX = e.targetTouches[0].clientX;
		e.clientY = e.targetTouches[0].clientY;
		if(e.targetTouches.length == 1) listener(e);
	}
	
} 





export default Events;