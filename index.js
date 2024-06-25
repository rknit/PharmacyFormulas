let desired_sol_cont;
let desired_type_select;
let desire_sol_edit_panel;
let desire_sol_confirmed_panel;
let base_sol_select;
let unused_base_sol_label;
let error_box;
let confirm_button;
let desire_sol_amount;
let glucose50_amount_display;
let total_amount_display;

const Type = Object.freeze({
	S: Symbol("S"),
	S_HALF: Symbol("S/2"),
});

const BASE_SOLUTIONS = Object.freeze([
	{ name: "D10S", dex: 10, type: Type.S },
	{ name: "D5S", dex: 5, type: Type.S },
]);

window.onload = () => {
	setUpDesiredSolInputs();

	base_sol_select = document.getElementById("base-sol-select");
	base_sol_select.addEventListener("change", calculateSolution);
	unused_base_sol_label = document.getElementById("unused-base-sol");

	glucose50_amount_display = document.getElementById("glucose-amount");

	total_amount_display = document.getElementById("total-amount");

	error_box = document.getElementById("error-box");
	resetResult();
};

function setUpDesiredSolInputs() {
	desired_sol_cont = document.getElementById("d-input");
	desired_sol_cont.addEventListener("change", verifyAndGetBaseSolutions);

	desired_type_select = document.getElementById("s-input");
	desired_type_select.addEventListener("change", verifyAndGetBaseSolutions);
	desired_type_select.replaceChildren(
		...Object.values(Type).map((s) => {
			let opt = document.createElement("option");
			opt.value = s.description;
			opt.innerHTML = s.description;
			return opt;
		})
	);

	desire_sol_amount = document.getElementById("d-amount");
	desire_sol_amount.addEventListener("change", verifyAndGetBaseSolutions);

	desire_sol_edit_panel = document.getElementById("d-s-edit");
	desire_sol_confirmed_panel = document.getElementById("d-s-confirmed");

	confirm_button = document.getElementById("confirm-button");
	confirm_button.addEventListener("click", onConfirmOrEdit);
}

function showVerifyError(msg) {
	error_box.innerHTML = `Error: ${msg}`;
	error_box.hidden = false;
	confirm_button.disabled = true;
}

function hideVerifyError() {
	error_box.hidden = true;
	confirm_button.disabled = false;
}

function verifyAndGetBaseSolutions() {
	const d_cont = Number(desired_sol_cont.value);
	if (
		desired_sol_cont.value.trim().length === 0 ||
		typeof d_cont === "undefined" ||
		d_cont === null ||
		isNaN(d_cont) ||
		!isFinite(d_cont) ||
		d_cont < 5 ||
		d_cont > 50
	) {
		showVerifyError("Dextrose concentration must be in range of 5-50%");
		return;
	}

	const d_sol_amount = Number(desire_sol_amount.value);
	if (
		desire_sol_amount.value.trim().length === 0 ||
		typeof d_sol_amount === "undefined" ||
		d_sol_amount === null ||
		isNaN(d_sol_amount) ||
		!isFinite(d_sol_amount) ||
		d_sol_amount <= 0
	) {
		showVerifyError("Invalid amount");
		return;
	}

	const d_type =
		desired_type_select.options[desired_type_select.selectedIndex].text;
	let solutions = Array.from(BASE_SOLUTIONS).filter(
		(s) => s.type.toString() == Symbol(d_type).toString() && s.dex <= d_cont
	);
	if (solutions.length == 0) {
		showVerifyError("Unable to find a base solution");
		return;
	}

	hideVerifyError();
	return solutions;
}

function reportAndShowBaseSolutions(base_solutions) {
	const d_cont = Number(desired_sol_cont.value);
	const d_type =
		desired_type_select.options[desired_type_select.selectedIndex].text;
	const d_amt = Number(desire_sol_amount.value);
	desire_sol_confirmed_panel.innerText = `D${d_cont}${d_type} ${d_amt}ml`;

	console.log(JSON.stringify(base_solutions));
	let options = base_solutions.map((sol) => {
		let opt = document.createElement("option");
		opt.value = sol.name;
		opt.innerHTML = sol.name;
		return opt;
	});
	base_sol_select.replaceChildren(...options);

	let preferred_sol_index = 0;
	let prev_points = Number.MAX_VALUE;
	for (let i = 0; i < base_solutions.length; i++) {
		let delta_dex = Math.abs(base_solutions[i].dex - d_cont);
		if (delta_dex < prev_points) {
			prev_points = delta_dex;
			preferred_sol_index = i;
		} else {
			break;
		}
	}
	base_sol_select.selectedIndex = preferred_sol_index;
}

function onConfirmOrEdit() {
	if (confirm_button.innerText == "Confirm") {
		let sols = verifyAndGetBaseSolutions();
		if (sols.length === 0) return;

		confirm_button.innerText = "Edit";
		desire_sol_edit_panel.classList.add("disabled");
		desire_sol_confirmed_panel.classList.remove("disabled");
		reportAndShowBaseSolutions(sols);
		calculateSolution();
	} else {
		confirm_button.innerText = "Confirm";
		desire_sol_edit_panel.classList.remove("disabled");
		desire_sol_confirmed_panel.classList.add("disabled");
		resetResult();
	}
}

function roundReportNumber(number, decimal_point = 1) {
	const decimal_shift = Math.pow(10, decimal_point);
	return (
		Math.round((number + Number.EPSILON) * decimal_shift) / decimal_shift
	);
}

function calculateSolution() {
	const base_sol = BASE_SOLUTIONS.find(
		(b) => b.name === base_sol_select.value
	);
	console.log(base_sol);

	const target_cont = Number(desired_sol_cont.value);
	const target_amt = Number(desire_sol_amount.value);
	const base_cont = base_sol.dex;
	const glu_cont = 50.0;

	const base_ratio = glu_cont - target_cont;
	const glu_ratio = target_cont - base_cont;

	let glu_amt = 0;

	if (base_ratio === 0) {
		unused_base_sol_label.hidden = false;
	} else {
		const glu_multiplier = target_amt / base_ratio;
		glu_amt = glu_ratio * glu_multiplier;
	}

	const total_amt = target_amt + glu_amt;

	console.log(`Base ${target_amt}ml, Glu ${glu_amt}ml, Total ${total_amt}ml`);

	glucose50_amount_display.innerText = `${roundReportNumber(glu_amt)}ml`;

	total_amount_display.innerText = `${roundReportNumber(total_amt)}ml`;
}

function resetResult() {
	let none_opt = document.createElement("option");
	none_opt.innerHTML = "---";
	none_opt.value = "none";
	none_opt.disabled = true;
	none_opt.selected = true;
	base_sol_select.replaceChildren(none_opt);
	unused_base_sol_label.hidden = true;

	glucose50_amount_display.innerText = "--- ml";

	total_amount_display.innerText = "--- ml";
}
