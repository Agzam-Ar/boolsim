

let urlAlphabet = "";//?/:@-._~!$&'()*+,;=";
for (let range of ["09", "az", "AZ"]) {
	for (var i = range.charCodeAt(0); i <= range.charCodeAt(1); i++) urlAlphabet += String.fromCharCode(i);
}
let urlExtraAlphabet = "?/:@-._~!$&'()*+,;=";
const radix = urlAlphabet.length-1;
const stopChar = urlAlphabet.charAt(radix);

console.log(urlAlphabet);


const Strings = {
	
	urlAlphabet: urlAlphabet,
	encodeNumber(num) {
		num = Math.floor(num);
		let result = "";
		if(num == 0) result = urlAlphabet.charAt(0);
		if(num < 0) {
			result = "-" + result;
			num = -num;
		}
		while(num > 0) {
			result += urlAlphabet.charAt(num%radix);
			num = Math.floor(num/radix);
		}
		return result + stopChar;
	},
	decodeNumber(code, props={index:0}) {
		let num = 0;
		let mul = 1;
		let negtive = false;
		for (; props.index < code.length; props.index++) {
			if(code.charAt(props.index) == stopChar) break;
			if(code.charAt(props.index) == '-') {
				negtive = true;
				continue;
			}
			num += mul*urlAlphabet.indexOf(code.charAt(props.index));
			mul *= radix;
		}
		props.index++;
		if(negtive) return -num;
		return num;
	},

}


window["Strings"] = Strings;

export default Strings;