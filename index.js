import {getDataPersist} from "./getdata.js";
console.log("What the sigma");

function renderGame() {
	const gameElement = document.body.querySelector("#game");

	let out = "";

	let row = "";
	for (let i=0;i<5;i++) row += `<td data-index=${i}><input /></td>`
	row = `</tr>${row}</tr>`;
	for (let i=0;i<5;i++) out += row;

	gameElement.innerHTML = `<tbody>${out}</tbody>`;

	addListeners();
}

renderGame();