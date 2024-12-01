import Vars from './Vars';

const Themes = {
	apply: (theme) => {
		Themes.theme = theme;
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

    	selectColor: "#da00ff",

		powerSize: .5,
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

    	selectColor: "#da00ff",

    	frameBorderColor: "#000",
    	frameBackground: "#9E9E9E",
    	frameHeadSize: "24px",
		frameResizeGap: "4px",
    	frameHeadColor: "#1B88E7",
    	frameHeadColorAccent: "#57A5E5",

		powerSize: .75,
		glow: false,
		powerBorderSize: 2,
		powerBorderColor: "#000000",
		mixBlend: "",
	},

	simpleDark: {
    	backgroundMain: "#1B1B1B",
    	backgroundAccent: "#212121",
    	unactive: "#545454",
    	power0: "#5E9EFF",
    	power50: "#5E9EFF",
    	power100: "#5E9EFF",
    	labelColor: "#fff",
    	funcColor: "#545454",
    	funcAccent: "#878787",

    	selectColor: "#da00ff",

		powerSize: .75,
		glow: false,
		powerBorderSize: 2,
		powerBorderColor: "#000000",
		mixBlend: "",
	},
	
	
};


Themes.apply(Themes.simple);
// Themes.apply(Themes.space);


window.addEventListener("keydown", (e) => {
	if(e.key == '1') Themes.apply(Themes.space);
	if(e.key == '2') Themes.apply(Themes.simple);
	if(e.key == '3') Themes.apply(Themes.simpleDark);
});


export default Themes;