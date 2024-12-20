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

    	frameBorderColor: "#1C0062",
    	frameBackground: "#0A0023",
    	frameBackgroundAccent: "#0A0023",
    	frameHeadSize: "20px",
		frameResizeGap: "4px",
    	frameHeadColor: "#050010",
    	frameHeadColorAccent: "#0A0023",


		powerSize: .5,
		nodeSize: .3,
		glow: true,
		powerBorderSize: 0,

		mixBlend: "mix-blend-plus-lighter",
		standart: false,
	},

	simple: {
    	backgroundMain: "#DBDBDB",
    	backgroundAccent: "#D2D2D2",
    	unactive: "#FFFFFF",
    	power0: "#1B88E7",
    	power50: "#1B88E7",
    	power100: "#1B88E7",
    	labelColor: "#fff",
    	labelBorderColor: "#777",
    	funcColor: "#fff",
    	funcAccent: "#D2D2D2",

    	selectColor: "#673AB7",

    	frameBorderColor: "#000",
    	frameBorderColorLight: "#777",
    	frameBackground: "#D2D2D2",
    	frameBackgroundAccent: "#BBB",
    	frameColor: "#000",
    	frameHeadSize: "20px",
		frameResizeGap: "4px",
    	frameHeadColor: "#777",
    	frameHeadColorAccent: "#888",

    	inputBackground: "#eee",
    	inputBackgroundHover: "#FFF",

    	tableResultBackground: "#92ccff",
    	tableResultBackgroundAccent: "#69b9ff",

		powerSize: .75,
		nodeSize: .3,
		glow: false,
		powerBorderSize: 2,
		powerBorderColor: "#000000",
		mixBlend: "",
		standart: false,
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

    	frameBorderColor: "#000",
    	frameBackground: "#212121",
    	frameColor: "#fff",
    	frameHeadSize: "20px",
		frameResizeGap: "4px",
    	frameHeadColor: "#2c2c2c",
    	frameHeadColorAccent: "#3c3c3c",

    	inputBackground: "#333",
    	inputBackgroundHover: "#444",

		powerSize: .75,
		nodeSize: .3,
		glow: false,
		powerBorderSize: 2,
		powerBorderColor: "#000000",
		mixBlend: "",
		standart: false,
	},

	scheme: {
    	backgroundMain: "#fff",
    	backgroundAccent: "#fff",
    	unactive: "#000",
    	power0: "#000",
    	power50: "#000",
    	power100: "#000",
    	labelColor: "#000",
    	funcColor: "#fff",
    	funcAccent: "#D2D2D2",

    	selectColor: "#673AB7",

    	frameBorderColor: "#000",
    	frameBorderColorLight: "#777",
    	frameBackground: "#D2D2D2",
    	frameBackgroundAccent: "#BBB",
    	frameColor: "#000",
    	frameHeadSize: "20px",
		frameResizeGap: "4px",
    	frameHeadColor: "#777",
    	frameHeadColorAccent: "#888",

    	inputBackground: "#eee",
    	inputBackgroundHover: "#FFF",

    	tableResultBackground: "#92ccff",
    	tableResultBackgroundAccent: "#69b9ff",

		powerSize: .75,
		nodeSize: .75,
		glow: false,
		powerBorderSize: 0,
		powerBorderColor: "#000000",
		mixBlend: "",
		standart: true,
	},
	
	
};

window["Themes"] = Themes;


Themes.apply(Themes.simple);
// Themes.apply(Themes.space);


window.addEventListener("keydown", (e) => {
	if(e.ctrlKey) {
		if(e.key == '1') Themes.apply(Themes.space);
		if(e.key == '2') Themes.apply(Themes.simple);
		if(e.key == '3') Themes.apply(Themes.simpleDark);
		if(e.key == '4') Themes.apply(Themes.scheme);
		if(e.key == '1' || e.key == '2' || e.key == '3' || e.key == '4') e.preventDefault();
	}
});


export default Themes;