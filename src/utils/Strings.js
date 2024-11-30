

let urlAlphabet = "";//?/:@-._~!$&'()*+,;=";
for (let range of ["09", "az", "AZ"]) {
	for (var i = range.charCodeAt(0); i <= range.charCodeAt(1); i++) urlAlphabet += String.fromCharCode(i);
}
let urlExtraAlphabet = "?/:@-._~!$&'()*+,;=";

console.log(urlAlphabet);


const Strings = {
	
	urlAlphabet: urlAlphabet,
	encodeNumber(num) {
		num = Math.floor(num);
		let result = "";
		let radix = urlAlphabet.length;
		while(num > 0) {
			result += urlAlphabet.charAt(num%radix);
			num = Math.floor(num/radix);
		}
		return result;
	}

}


window["Strings"] = Strings;

export default Strings;