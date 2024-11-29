import Vars from './Vars';

const Themes = {
	apply: (theme) => {
		Themes.theme = theme;
			console.log("Applying theme", theme);

		for (var name of Object.keys(theme)) {
			let cssName = Themes.toCssVarName(name);
			// console.log(name, cssName, theme[name]);
			document.documentElement.style.setProperty(cssName, theme[name]);
		}

		// document.documentElement.style.setProperty(`--${}`, '#YOURCOLOR');
		
		Vars.renderScheme();
	},

	toCssVarName: (name) => {
		let css = "--";
		const isLowerCase = (char) => char == char.toLowerCase();
		for (var i = 0; i < name.length; i++) {
			css += name.charAt(i);
			if(isLowerCase(name.charAt(i)) && !isLowerCase(name.charAt(i+1))) {
				css += '-' + name.charAt(i+1).toLowerCase();
				i++;
				continue;
			}
		}
		return css;
	},

	space: {
    	backgroundMain: "#050010",
    	backgroundAccent: "#0A0023",
    	unactive: "#1C0062",
    	power0: "#ff00aa",
    	power50: "#7F7FCD",
    	power100: "#00FFF1",
    	labelColor: "#fff",
    	funcColor: "#050010",
    	funcAccent: "#1C0062",

		powerSize: .25,
		glow: true,
		powerBorderSize: 0,

		mixBlend: "mix-blend-plus-lighter",
	},

	simple: {
    	backgroundMain: "#DBDBDB",
    	backgroundAccent: "#D2D2D2",
    	unactive: "#FFFFFF",
    	power0: "#1B88E7",
    	power50: "#1B88E7",
    	power100: "#1B88E7",
    	labelColor: "#000",
    	funcColor: "#fff",
    	funcAccent: "#D2D2D2",

		powerSize: .75,
		glow: false,
		powerBorderSize: 2,
		powerBorderColor: "#000000",
		mixBlend: "",
	}


};


Themes.apply(Themes.simple);
// Themes.apply(Themes.space);


window.addEventListener("keydown", (e) => {
	if(e.key == '1') Themes.apply(Themes.space);
	if(e.key == '2') Themes.apply(Themes.simple);
});


export default Themes;