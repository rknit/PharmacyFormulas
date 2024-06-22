let dex_num_input;
let desire_sol_select;
let desire_sol_confirm;
let solvent_select;
let base_sol_select;
let error_box;
let confirm_button;

const Solvents = Object.freeze({
	S: Symbol("S"),
	S_HALF: Symbol("S/2"),
	W: Symbol("W"),
});

const BASE_SOLUTIONS = [
	{ name: "D10S", dex: 10, solvent: Solvents.S },
	{ name: "D5S", dex: 5, solvent: Solvents.S },
	{ name: "50% glucose", dex: 50, solvent: Solvents.W },
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

function verifyAndGetBaseSolutions() {
	const dex = Number(dex_num_input.value);
	if (
		dex_num_input.value.trim().length === 0 ||
		typeof dex === "undefined" ||
		dex === null ||
		isNaN(dex) ||
		!isFinite(dex) ||
		dex <= 0
	) {
		showError("Invalid Dextrose value");
		return;
	}

	const solvent = solvent_select.options[solvent_select.selectedIndex].text;
	let solutions = Array.from(BASE_SOLUTIONS)
		.filter((s) => s.solvent.description === solvent && s.dex <= dex)
		.sort((lhs, rhs) => lhs.dex < rhs.dex);
	if (solutions.length == 0) {
		showError("Unable to find a base solution");
		return;
	}

	hideError();
	return solutions;
}

function reportAndShowBaseSolutions(base_solutions) {
	const dex = Number(dex_num_input.value);
	const solvent = solvent_select.options[solvent_select.selectedIndex].text;
	desire_sol_confirm.innerText = `D${dex}${solvent}`;

	console.log(JSON.stringify(base_solutions));
	let options = base_solutions.map((sol) => {
		let opt = document.createElement("option");
		opt.value = sol.name;
		opt.innerHTML = sol.name;
		return opt;
	});
	base_sol_select.replaceChildren(...options);
}

function resetBaseSolutions() {
	let none_opt = document.createElement("option");
	none_opt.innerHTML = "---";
	none_opt.value = "none";
	none_opt.disabled = true;
	none_opt.selected = true;
	base_sol_select.replaceChildren(none_opt);
}

function onConfirmOrEdit() {
	if (confirm_button.innerText == "Confirm") {
		let sols = verifyAndGetBaseSolutions();
		if (sols.length === 0) return;

		confirm_button.innerText = "Edit";
		desire_sol_select.classList.add("disabled");
		desire_sol_confirm.classList.remove("disabled");
		reportAndShowBaseSolutions(sols);
	} else {
		confirm_button.innerText = "Confirm";
		desire_sol_select.classList.remove("disabled");
		desire_sol_confirm.classList.add("disabled");
		resetBaseSolutions();
	}
}

window.onload = () => {
	setUpDexInputs();
	setUpSalineInputs();

	desire_sol_select = document.getElementById("d-s-select");
	desire_sol_confirm = document.getElementById("d-s-confirm");

	confirm_button = document.getElementById("confirm-button");
	confirm_button.addEventListener("click", onConfirmOrEdit);

	error_box = document.getElementById("error-box");

	base_sol_select = document.getElementById("base-sol-select");
	resetBaseSolutions();
};

function setUpDexInputs() {
	dex_num_input = document.getElementById("d-input");
	dex_num_input.addEventListener("change", verifyAndGetBaseSolutions);
}

function setUpSalineInputs() {
	solvent_select = document.getElementById("s-input");
	solvent_select.addEventListener("change", verifyAndGetBaseSolutions);
	solvent_select.replaceChildren(
		...Object.values(Solvents).map((s) => {
			let opt = document.createElement("option");
			opt.value = s.description;
			opt.innerHTML = s.description;
			return opt;
		})
	);
}
