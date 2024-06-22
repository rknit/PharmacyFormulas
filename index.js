let dex_num_input;
let desire_sol_select;
let desire_sol_confirm;
let solvent_select;
let base_sol_select;
let error_box;
let confirm_button;

const SOLVENTS = ["S", "W", "S/2"];

const BASE_SOLUTIONS = [
	{ name: "D10S", dex: 10, solvent: "S" },
	{ name: "D5S", dex: 5, solvent: "S" },
	{ name: "50% glucose", dex: 50, solvent: "W" },
];

function showError(msg) {
	error_box.innerHTML = `Error: ${msg}`;
	error_box.hidden = false;
	confirm_button.disabled = true;
}

function hideError() {
	error_box.hidden = true;
	confirm_button.disabled = false;
}

function onDextroseChange() {
	const dex = Number(dex_num_input.value);
	if (
		dex_num_input.value.trim().length === 0 ||
		typeof dex === "undefined" ||
		dex === null ||
		isNaN(dex) ||
		!isFinite(dex) ||
		dex <= 0
	)
		dex_num_input.value = "10.0";

	getBaseSolutions();
}

function getBaseSolutions() {
	const dex = Number(dex_num_input.value);
	const solvent = solvent_select.options[solvent_select.selectedIndex].text;

	console.log(`Dex=${dex}, Solvent=${solvent}`);
	let solutions = Array.from(BASE_SOLUTIONS)
		.filter((s) => s.solvent === solvent && s.dex <= dex)
		.sort((lhs, rhs) => lhs.dex < rhs.dex);

	if (solutions.length == 0) showError("Unable to find a base solution");
	else hideError();
	return solutions;
}

function setBaseSolutions(solutions) {
	console.log(JSON.stringify(solutions));
	let options = solutions.map((sol) => {
		let opt = document.createElement("option");
		opt.value = sol.name;
		opt.innerHTML = sol.name;
		return opt;
	});
	base_sol_select.replaceChildren(...options);
}

function reportDesiredSolution() {
	const dex = Number(dex_num_input.value);
	const solvent = solvent_select.options[solvent_select.selectedIndex].text;
	desire_sol_confirm.innerText = `D${dex}${solvent}`;
}

function onConfirmOrEdit() {
	if (confirm_button.innerText == "Confirm") {
		let solutions = getBaseSolutions();
		if (solutions.length == 0) return;

		confirm_button.innerText = "Edit";
		desire_sol_select.classList.add("disabled");
		desire_sol_confirm.classList.remove("disabled");
		reportDesiredSolution();
		setBaseSolutions(solutions);
	} else {
		confirm_button.innerText = "Confirm";
		desire_sol_select.classList.remove("disabled");
		desire_sol_confirm.classList.add("disabled");

		setBaseSolutions([]);
	}
}

window.onload = () => {
	base_sol_select = document.getElementById("base-sol-select");
	dex_num_input = document.getElementById("d-input");
	dex_num_input.addEventListener("change", onDextroseChange);
	setUpSalineInputs();

	desire_sol_select = document.getElementById("d-s-select");
	desire_sol_confirm = document.getElementById("d-s-confirm");

	confirm_button = document.getElementById("confirm-button");
	confirm_button.addEventListener("click", onConfirmOrEdit);

	error_box = document.getElementById("error-box");
};

function setUpSalineInputs() {
	solvent_select = document.getElementById("s-input");
	solvent_select.addEventListener("change", getBaseSolutions);
	solvent_select.replaceChildren(
		...SOLVENTS.map((s) => {
			let opt = document.createElement("option");
			opt.value = s;
			opt.innerHTML = s;
			return opt;
		})
	);
}
