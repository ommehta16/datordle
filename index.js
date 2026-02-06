// @ts-check


/**
 * @typedef {{
 * 	state:string
 * }} Guess
 */

/** 
 * @typedef {{state:string, rank:number}[]} Category
 */

/** 
 * @typedef {{
 * 	guesses: Guess[],
 * 	categories: string[],
 * 	meta: {[key:string]:string},
 * 	stats: {[category:string]: Category}
 * 	onUpdate: Function,
 * 	states: string[],
 * 	goal: string,
 * 	won: boolean,
 * 	onWin: ()=>any;
 * }} Game;
 */

/** @type {Game} */
const game = {
	guesses: [],
	onUpdate: renderGame,
	meta: {},
	categories: [],
	stats: {},
	states: [],
	goal: "",
	won:false,
	onWin: ()=>{}
};

/** @type {{[acronym:string]:string}} */
let stateAcronyms = {};

async function loadStats() {
	// load stats for each state in [somehow]

	const [raw, acronymsRaw] = await Promise.all([fetch("categories.json"), fetch("acronyms.json")]);

	/** 
	 * @type {[{
	 * 	[category:string]: {
	 * 		name:string,
	 * 		values: {
	 * 			[state:string]:number
	 * 		},
	 * 		ranks: {
	 * 			[state:string]:number
	 * 		}
	 * 	}
	 * }, 
	 * {
	 * [acronym:string]: string
	 * }
	 * ]} 
	 */
	const [data, acronymsData] = await Promise.all([raw.json(), acronymsRaw.json()]);
	stateAcronyms=acronymsData;

	for (const categoryName of Object.keys(data)) {
		const categoryData = data[categoryName];
		
		/** @type {Category} */
		const category = [];
		for (const state of Object.keys(categoryData.ranks)) {
			category.push({
				state:state,
				rank: categoryData.ranks[state]
			});
			game.states.push(state);
		}
		game.stats[categoryData.name] = category;
		// game.categories.push(categoryData.name);
	}
	game.states = Array.from(new Set(game.states)); // remove ALL the duplicate states
	game.goal = game.states[Math.floor(Math.random()*game.states.length)];
}

/** @param {string[][]} rows */
function flattenRows(rows) {	
	const rowList = rows.map((el,i)=> {
		const rowInner = el.map((inner)=>inner.startsWith("<td")&&inner.endsWith("</td>") ? inner : `<td>${inner}</td>`).join("");
		return `<tr>${rowInner}</tr>`;
	});
	if (rowList.length == 0) return "";
	let out = `
	<thead>
		${rowList[0]}
	</thead>
	<tbody>
		${rowList.slice(1).join("")}
	</tbody>
	`;
	return out;
}

function renderGame() {
	const gameElement = document.body.querySelector("#game");
	if (!gameElement) return;

	/** @type {string[][]} */
	const rows = [];
	
	// add header
	const header = ["State", ...game.categories.map(prettyCategory)];
	rows.push(header);

	const goalRow = (()=>{
		const rowParts = [];

		rowParts.push("?");

		for (const category of game.categories) {
			game.stats[category].sort((a,b)=>a.rank-b.rank);
			const place = game.stats[category].findIndex(el=>el.state==game.goal)+1; // functional >> 
			rowParts.push(`#${place}`);
		}

		return rowParts;
	})()

	rows.push(goalRow);
	
	// add previously guessed items as rows
	for (const guess of game.guesses) {
		
		/** @type {string[]} */
		const rowParts = [];

		rowParts.push(prettyState(guess.state));

		if (!game.states.includes(guess.state)) {
			console.log(`could not find state ${guess.state}!`)
			for (const category of game.categories) rowParts.push("");
			rows.push(rowParts);
			continue;
		}
		for (const category of game.categories) {
			game.stats[category].sort((a,b)=>a.rank-b.rank);
			const place = game.stats[category].findIndex(el=>el.state==guess.state)+1; // functional >> 
			rowParts.push(`#${place}`);
		}

		rows.push(rowParts);
	}
	
	const inputRow = [`<td colspan="${Math.min(rows[0].length,1)}"><div id="input-cell"><input placeholder="guess a state..."/><button id="sendit" title="Submit guess...">?</button></div></td>`, /*...game.categories.map(e=>``)*/];
	
	if (!game.won) rows.push(inputRow);
	
	let out = flattenRows(rows);

	gameElement.innerHTML = out;

	document.querySelector("button#sendit")?.addEventListener("click",sendInput);
	document.querySelector("input")?.addEventListener("keyup",e=>{ e.key=="Enter" && sendInput(); });
}

function sendInput() {
	if (document.querySelector("div#input-cell[data-error]")) return;
	const state = processState();
	if (state == "") {
		doInputError("Not a state!");
		return;
	}
	if (game.guesses.find(el=>el.state==state)) {
		doInputError("Already guessed!");
		return;
	}
	
	game.guesses.push({
		state: state
	});
	if (state == game.goal) {
		game.won=true;
		game.onWin();
	}

	if (game.categories.length == Object.keys(game.stats).length) {
		renderGame();
		return;
	}

	const availableCategories = Object.keys(game.stats);

	let newCategory = game.categories[0];
	while (game.categories.includes(newCategory)) {
		newCategory = availableCategories[Math.floor(Math.random()*availableCategories.length)];
	}
	game.categories.push(newCategory);

	renderGame();
	
	const getFocus = ()=>{
		const inp=document.querySelector("input");
		if (!inp) return getFocus();
		inp.focus();
	}
	setTimeout(getFocus,10);
	setTimeout(getFocus,100);
}

/** @param {string} a @param {string} b */
function editDistance(a, b) {

	const stringA = a.toLocaleLowerCase().replaceAll(" ","");
	const stringB = b.toLocaleLowerCase().replaceAll(" ","");

	/** @type {number[][]} */
	let mem = [];
	for (let i=0;i<=a.length;i++) {
		const row=[];
		for (let j=0;j<=b.length;j++) row.push(Infinity);
		mem.push(row);
	}
	
	/** 
	 * @param {number} n how far into a
	 * @param {number} m how far into b
	 * @returns {number}
	 */
	const editDistRec=(n, m)=>{
		if (n==0) return m;
		if (m==0) return n;

		if (mem[n][m] != Infinity) return mem[n][m];

		if (stringA.charAt(n-1) == stringB.charAt(m-1)) {
			mem[n-1][m-1] = editDistRec(n-1,m-1);
			return mem[n-1][m-1];
		}
		
		mem[n][m] = Math.min(
			editDistRec(n,m-1), // add to b
			editDistRec(n-1,m), // add to a
			editDistRec(n-1,m-1) // insert in one
		)+1;
		return mem[n][m];
	}

	return editDistRec(a.length, b.length);
}

function processState() {
	const states = game.states;

	const TYPOTHRESHOLD = 2; // i.e. can be wrong by literally our entire length
	
	let chosenState = document.querySelector("input")?.value; // it will have a value, this is just for jsdoc's state
	if (!chosenState) return "";

	if (chosenState.toUpperCase() in stateAcronyms) chosenState = stateAcronyms[chosenState.toUpperCase()];
	chosenState=chosenState.toLocaleLowerCase().replaceAll(" ","");
	const cleanStates = states.map(el=>[el, el.replaceAll(" ","").toLocaleLowerCase()]);
	for (const [state, clean] of cleanStates) {
		if (chosenState.replace(" ", "") == clean) return state;
	}

	let closestDistance=Infinity;
	let closestState="";
	let tie=false;

	let closestStart=Infinity;
	let startState="";

	for (const [state, clean] of cleanStates) {
		if (clean.startsWith(chosenState.toLowerCase().replaceAll(" ",""))) {
			const dist = (clean.length - chosenState.length)/chosenState.length;
			if (dist > closestStart) continue;
			closestStart=dist;
			startState=state;
		}

		// if (clean.charAt(0) != chosenState.charAt(0)) continue; // they didnt even try :sob:
		const dist = editDistance(clean, chosenState)/chosenState.length;
		if (dist > closestDistance) continue;
		if (dist == closestDistance) {
			tie=true;
			continue;
		}
		tie=false;
		closestState=state;
		closestDistance=dist;
		
	}
	if (closestStart < closestDistance*2 && closestStart<TYPOTHRESHOLD) return startState;
	
	if (!tie && closestDistance<TYPOTHRESHOLD) return closestState;

	console.log(closestState, closestDistance);

	return "";
}

/** @param {string} state */
function prettyState(state) {
	let out = "";
	for (let i=0;i<state.length;i++) {
		if (i==0 || state.charAt(i-1) == " ") out += state.charAt(i).toUpperCase();
		else out += state.charAt(i);
	}
	return out;
}

/** @type {{[key:string]:string}} */
const prettyCategories = {
	"Cost of Living (2026)": "Cost of Living",
	"Obesity (2015)": "Obesity",
	"Hate Crimes per 100k": "Hate Crimes<sub>/100k</sub>",
	"Violent Incidents per 100k (2024)": "Violent Incidents<sub>/100k</sub>",
	"Happiness Score (2026)": "Happiness Score",
	"Income Inequality (Gini Coefficient) (2026)": "Income Inequality<sub>Gini coef.</sub>",
	"Unemployment Rate (2025)": "Unemployment Rate",
	"GDP per Capita (2017)": "Economy<sub>GDP/cap.</sub>",
	"Education (Pre-K-12) Score": "Education<sub>pre-K-12</sub>",
	"Total McDonalds_Outlets (2021)": "McDonalds<sub>total locations</sub>",
	" Alphabetical Order": " Alphabetical Order",
	"Avg Temp °F (2000)": "Temperature<sub>2000 Avg., °F</sub>",
	"Life Expectancy (2021)": "Life Expectancy",
	"Corporate Tax Rate (2026)": "Corporate Tax Rate",
	"Population (2020)": "Population",
};



/** @param {string} category */
function prettyCategory(category) {
	if (category in prettyCategories) return prettyCategories[category];
	
	return category;
}

/** @param {string} error */
function doInputError(error="") {
	const inputCell = document.querySelector("div#input-cell");
	const inputBox = document.querySelector("input");
	if (!inputCell || !inputBox) return;
	
	inputCell.setAttribute("data-error","error");
	inputBox.value="";
	inputBox.placeholder=error;
	setTimeout(()=>{
		inputCell.removeAttribute("data-error");
		inputBox.placeholder="guess a state...";
	},1000);
}

async function reset() {
	const gameElement = document.querySelector("#game");
	if (!gameElement) {
		setTimeout(reset, 100);
		return;
	}
	console.log("resetting")
	gameElement.removeAttribute("won");
	game.guesses=[];
	game.meta={}
	game.won=false;
	await loadStats();
	
	game.categories=[];
	game.categories.push(Object.keys(game.stats)[Math.floor(Math.random()*Object.keys(game.stats).length)]);
	renderGame();
	setTimeout(()=>{document.querySelector("input")?.focus()},100);
}

game.onWin = () => {

	const gameElement = document.querySelector("#game");
	if (!gameElement) return;

	const winStats = document.querySelector("#win-stats");
	if (!winStats) return;

	winStats.innerHTML=`It took you ${game.guesses.length < 5 ? "just " : game.guesses.length > 15 ? "a whole " : ""
	} ${game.guesses.length} ${game.guesses.length == 1 ? "guess" : "guesses"}!${
		(game.categories.length==Object.keys(game.stats).length) ?
			` Over those guesses, you revealed all ${game.categories.length} categories!` :
		(game.guesses.length == game.states.length) ? 
			` Over those guesses, you checked <b>all 50 states</b>!` :
			``
	}`;

	gameElement.setAttribute("won","true");
	
	const confettiCount = 200;
	const confettiDefaults = {
		origin: { y: 0.7 }
	};
	
	/** @param {number} particleRatio @param {{}} opts */ // @ts-ignore
	const fire = (particleRatio, opts) => confetti({...confettiDefaults, ...opts, particleCount: Math.floor(confettiCount*particleRatio)});

	fire(0.25, { spread: 26, startVelocity: 55, });
	fire(0.2, { spread: 60, });
	fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
	fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
	fire(0.1, { spread: 120, startVelocity: 45 });

	// @ts-ignore
	confetti({
		particleCount: 100,
		spread: 70,
		origin: { y: 0.6 }
	//@ts-ignore
	}).then(() => {document.querySelector("dialog#you-win").showModal()});
	
}

// @ts-ignore
document.querySelector("#you-win button#play-again")?.addEventListener("click",()=>{reset(); document.querySelector("dialog#you-win").close();});
reset();