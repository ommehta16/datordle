// @ts-check


/**
 * @typedef {{
 * 	state:string
 * }} Guess
 */

/** 
 * @typedef {{
 * 	[stat:string]: number
 * }} StateStats
 */

/** 
 * @typedef {{
 * 	guesses: Guess[],
 * 	categories: string[],
 * 	meta: {[key:string]:string},
 * 	stats: {[state:string]: StateStats}
 * 	onUpdate: Function
 * }} Game;
 */

/** @type {Game} */
const game = {
	guesses: [],
	onUpdate: renderGame,
	meta: {},
	categories: [],
	stats: {}
};

function loadStats() {
	// load stats for each state in [somehow]
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
	
	// add previously guessed items as rows
	for (const guess of game.guesses) {
		
		/** @type {string[]} */
		const rowParts = [];

		rowParts.push(guess.state);
		
		if (!(guess.state in game.stats)) throw new Error(`No stats found for state ${guess.state}`);
		for (const category of game.categories) {
			const place = game.stats[guess.state][category];
			rowParts.push(`#${place}`);
		}

		rows.push(rowParts);
	}
	
	const inputRow = [`<input placeholder="type!"/><button id="sendit"/>`, ...game.categories.map(e=>``)];
	rows.push(inputRow);
	
	let out = flattenRows(rows);

	gameElement.innerHTML = out;

	document.querySelector("button#sendit")?.addEventListener("click",e=>{
		game.guesses.push({
			state: document.querySelector("input")?.value || "oklahoma"
		});
		renderGame();
	})
}

renderGame();