
const boxPortsZero = {
	u1: (box) => 0,
	v1: (box) => 0,
	u2: (box) => 0,
	v2: (box) => 0,
};
const boxZero = {
	in: boxPortsZero,
	out: boxPortsZero,
};

const blocktypes = [
	{
		name: "switch",
	    outputs: {min:1},
	    inputs: {min:0,max:0},
	    func: (a,is,os) => {
			for (var i = 0; i < os.length; i++) {
				os[i].active = a;
			}
	    },
		box: {
			// Output ports lines
			out: {
				u1: (box) => Math.min(box.w, box.h)*.5,
				v1: (box) => 0,
				u2: (box) => 10,
				v2: (box) => 0,
			},
		}
	},
	{
		name: "and",
	    outputs: {min:1,max:1},
	    inputs: {value:2,min:1},
	    func: (a,is,os) => {
			a = true;
			for (let i of is) {
				if(i.active) continue;
				a = false;
				break;
			}
			for (let o of os) {
				o.active = a;
			}
			return a;
	    },
	    box: {
	    	in: {
				u1: (box) => -Math.min(box.w, box.h)*.3+.5,
				u2: (box) => -10,
				v2: (box, i) => -i*10,
	    	},
			out: {
				u1: (box) => Math.min(box.w, box.h)*.5,
				v1: (box) => 0,
				u2: (box) => 10,
				v2: (box) => 0,
			},
	    },
	},
	{
		name: "or",
	    outputs: {min:1,max:1},
	    inputs: {value:2,min:1},
	    func: (a,is,os) => {
	    	a = false;
			for (let i of is) {
				if(!i.active) continue;
				a = true;
				break;
			}
			for (let o of os) {
				o.active = a;
			}
			return a;
	    },
	    box: {
	    	in: {
				u1: (box) => -Math.min(box.w, box.h)*.3+.5,
				u2: (box) => -10,
				v2: (box, i) => -i*10,
	    	},
			out: {
				u1: (box) => Math.min(box.w, box.h)*.5,
				v1: (box) => 0,
				u2: (box) => 10,
				v2: (box) => 0,
			},
	    },
	},
	{
		name: "not",
	    outputs: {min:1,max:1},
	    inputs: {min:1,max:1},
	    func: (a,is,os) => {
	    	console.log("not is: ", is.length);
			if(is.length != 1) return false;
			a = !is[0].active;
	    	console.log("not is: ", a, is[0]);
			for (let o of os) {
				o.active = a;
			}
			return a;
	    },
	    box: {
	    	in: {
				u2: (box) => -10,
				v2: (box) => 0,
				u1: (box) => -Math.min(box.w, box.h)*.5,
				v1: (box) => 0,
	    	},
	    	out: {
				u1: (box) => Math.min(box.w, box.h)*.5+2,
				v1: (box) => 0,
				u2: (box) => 10,
				v2: (box) => 0,
	    	}
	    }
	},
	{
		name: "node",
	    outputs: {min:1,max:1},
	    inputs: {min:1,max:1},
	    func: (a,is,os) => {
	    	if(is.length <= 0) return false;
			a = is[0].active;
			for (let o of os) {
				o.active = a;
			}
			return a;
	    },
	    box: boxZero,
	},
	{
		name: "lamp",
	    outputs: {min:0,max:0},
	    inputs: {min:1},
	    func: (a,is,os) => {
			a = false;
			for (let i of is) {
				if(!i.active) continue;
				return true;
			}
			return false;
	    },
	},
];

const BlockTypes = {
	all: {},
};


for (var i = 0; i < blocktypes.length; i++) {
	BlockTypes[i] = blocktypes[i];
	BlockTypes[blocktypes[i].name] = blocktypes[i];
	BlockTypes.all[blocktypes[i].name] = i;
}

window["BlockTypes"] = BlockTypes;


export default BlockTypes;