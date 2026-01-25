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
 * 	goal: string
 * 	won: boolean
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
	won:false
};

async function loadStats() {
	// load stats for each state in [somehow]
	const raw = await fetch("categories.json");

	/** 
	 * @type {{
	 * 	[category:string]: {
	 * 		name:string,
	 * 		values: {
	 * 			[state:string]:number
	 * 		},
	 * 		ranks: {
	 * 			[state:string]:number
	 * 		}
	 * 	}
	 * }} 
	 */
	const data = await raw.json();

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

/** @param {string} category */
function getPrettyCategory(category) {
	return category;
}

/** @param {string[][]} rows */
function flattenRows(rows) {	
	const rowList = rows.map((el,i)=> {
		const rowInner = el.map((inner)=>`<td>${inner}</td>`).join("");
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
	const header = ["State", ...game.categories.map(getPrettyCategory)];
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
	
	const inputRow = [`<div id="input-cell"><input placeholder="guess a state..."/><button id="sendit">?</button></div>`, ...game.categories.map(e=>``)];
	
	if (!game.won) rows.push(inputRow);
	
	let out = flattenRows(rows);

	gameElement.innerHTML = out;

	document.querySelector("button#sendit")?.addEventListener("click",sendInput);
	document.querySelector("input")?.addEventListener("keyup",e=>{ e.key=="Enter" && sendInput(); });
}

function sendInput() {
	
	const state = processState();
	game.guesses.push({
		state: state
	});
	if (state == game.goal) {
		game.won=true;
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
}

function processState() {
	const states = game.states;
	let chosenState = document.querySelector("input")?.value ?? "ERROE"; // it will have a value, this is just for jsdoc's state
	chosenState = chosenState.toLocaleLowerCase(); // idk how this would be different than toLowerCase but um lets not take any risks lol
	for (const state of states) {
		if (chosenState.replace(" ", "") == state.replace(" ","")) {
			return state;
		}
	}
	return chosenState;
}

loadStats().then(
	() =>  {
		game.categories.push(Object.keys(game.stats)[Math.floor(Math.random()*Object.keys(game.stats).length)]);
		renderGame();
	}
)

/** @param {string} state */
function prettyState(state) {
	let out = "";
	for (let i=0;i<state.length;i++) {
		if (i==0 || state.charAt(i-1) == " ") out += state.charAt(i).toUpperCase();
		else out += state.charAt(i);
	}
	return out;
}