let formMarkup = document.createElement('div');
formMarkup.className = 'wg-form-container form-container';

formMarkup.innerHTML = `
	<form id="wg-form">
		<div class="wg-form-loader">
			<div class="wg-form-loader__indicator"></div>  
		<div>
	</form>
`

document.querySelector('.form').innerHTML = formMarkup.outerHTML

const $formContainer = document.querySelector(".wg-form-container");
const $form = document.getElementById("wg-form");
let hasPageBreak = 0;


let { form_redirect, form_sheet, form_to_use } = window.formConfig;

console.log(form_redirect, form_sheet, form_to_use)

const formType = document.querySelectorAll("main p");
let formToUse = "";

// Hide sheet and thank you link from page while loading...
document.querySelector('main').style.opacity = '1'


async function formData() {
	const resp = await fetch(`${form_to_use}.json`);
	const json = await resp.json();
	window.pages.dependencies.push(`${form_to_use}.json`);
	return json;
}


/**
 * @param {string} label
 * label = string of form input
*/
function inputSettings(label) {
	let visibleLabel = label;
	label = label.indexOf(' ') >= 0 ? label.split(' ').join('-').toLowerCase() : label.toLowerCase();
	label = label.indexOf("-*") >= 0 ? label.split('*')[0] : label;
	label = label.indexOf('-(') >= 0 ? label.split('(')[0] : label;
	let settings = {
		label: visibleLabel,
		label_clean: label,
		required: visibleLabel.indexOf("*") >= 0 ? "required" : '',
	}
	return settings;
}

function csvOrLinesToArray(input) {
	if (input.includes('\n')) {
		return input.split('\n').map(o => o.trim());
	} else {
		return input.split(',').map(o => o.trim());
	} 
}


async function createForm(formId) {
	let formField = "";
	let formSubmitPresent = false;
	let output = await formData();
	console.log(output)
	document.querySelectorAll('main')[0].style.opacity = '1'
	output = output.data;
	

	let checkIfSlider = () => {
		output.find(pageBreak => {
			if(pageBreak.type == "page-break") {
				hasPageBreak = hasPageBreak + 1;
				hasPageBreak = hasPageBreak > 0 ? true : false;
			}
		})
	}
	
	checkIfSlider();
	

	
	output.forEach((item, index) => {
		const setup = inputSettings(item.label);
		const name=item.name?item.name:setup.label_clean; 
		const required=item.required?item.required:setup.required;  
		let description = hasPageBreak && item.description.length > 0 ? `<span class="description-title">${item.description}</span>` : '';
		
		let placeholder = item.placeholder ? true : false;
		
		if(placeholder) {
			if(item.placeholder.length > 3) {
				placeholder = `${item.placeholder}`  
			} else {
				placeholder='';
			}
		} else {
			placeholder = ''
		}
		
		if(index == 0 && hasPageBreak) {
			formField += `
			<div class="slide-form-container">
				<div class="slide-form-item active">
						`
		}
		
		// INPUT TEXT || EMAIL
		if (item.type === "text" || item.type === "email") {
			
			formField += `
			<div class="input-el question is-${required}">
				<div class="title-el">
					<label class="label-title" for="${name}">${setup.label}</label>
					${description}
				</div>
				<input type="${item.type}" name="${name}" placeholder="${placeholder}" ${required}/>
			</div>
			`;
		}

		// RADIO INPUTS
		if (item.type.includes("radio")) {
			let optionsAll = csvOrLinesToArray(item.options);
			let radioOption = "";

			optionsAll.forEach(function (option) {
				const cleanOptionName = toClassName(option);
				const id=name+'-'+cleanOptionName;
				const value=option.replace('"','');
				

				radioOption += `
				<div class="radio-option">
					<input type="radio" id="${id}" name="${name}" value="${value}" ${required}/>
					<label for="${id}">${option}</label>
				</div>
			`;
			});
			formField += `
				<div class="radio-el question is-${required}">
					<div class="title-el">
						<span class="label-title">${item.label}</span>
						${description}
					</div>
					<div class="radio-options-parent">
						${radioOption}
					</div>
				</div>
			`;
		}

		// CHECKBOXES
		if(item.type === "checkbox") {
			let checkbox_options = csvOrLinesToArray(item.options);
			let options = "";
			checkbox_options.forEach(function(option) {
				const cleanOptionName = toClassName(option);
				const id=name+'-'+cleanOptionName;
				const value=option.replace('"','');

				options += `
					<div class="radio-option">
						<input type="checkbox" 
							id="${id}" 
							name="${name}"
							value="${value}"
						/>
						<label for="${id}">${option}</label>
					</div>
				
				`
			})
			formField += `
				<div class="input-el checkboxes ${required} question is-${required}">
					<div class="title-el">
						<span class="label-title">${item.label}</span>
						${description}
					</div>
					${options}
				</div>
			`
		}


		// SELECT 
		if(item.type === "select") {
			let select_options = csvOrLinesToArray(item.options);
			let options = "";
			select_options.forEach(function(option) {
				options += `
					<option>${option}</option>
				`
			})
			formField += `
				<div class="select-el question is-${required}">
					<div class="title-el">
						<label class="label-title" for="${name}">${item.label}</label>
						${description}  
					</div>
					<select name="${name}" id="${name}">
						${options}
					</select>
				</div>
			`
		}

		// TEXTAREA
		if(item.type === "textarea") {
			
			formField += `
				<div class="text-el question is-${required}">
					<div class="title-el">
						<label class="label-title" for="${name}">${item.label}</label>
						${description}
					</div>
					<textarea
						name="${name}"
						cols="30"
						rows="5"
						placeholder="${placeholder}"
						${required}
					></textarea>
				</div>
			`
		}
		
		// TEXTAREA
		if(item.type === "title") {
			formField += `
				<div class="text-el question is-${required}">
					<div class="title-el">
						<label class="label-title" for="${name}">${item.label}</label>
						${description}
					</div>
					<hr>
				</div>
			`
		}

		if(item.type == "page-break" && hasPageBreak) {
			formField += `</div> <div class='slide-form-item'>`
		}

		if(index === output.length - 1 && hasPageBreak) {
			formField += `</div></div>`
		}
		

		// Submit Button
		if(item.type === "submit" && !hasPageBreak) {
			formField += `
				<div class="submit-el">
					<button type="submit">${item.label}</button>
				</div>
			`;
			formSubmitPresent=true;
		}
	});

	if (!formSubmitPresent && !hasPageBreak) {
			formField += `
		<div class="submit-el">
			<button type="submit">Submit</button>
		</div>`;
	}
	const $form=document.getElementById(formId)
	$form.innerHTML = formField;

	if(hasPageBreak) {
		let slidePanelParent = document.createElement('div');
		slidePanelParent.classList.add('panel');

		slidePanelParent.innerHTML = `
			<div class="panel__item">
				<div class="form-sliders-btns">
					<button class="slide-btn prev" type="button">Back</button>
					<button class="slide-btn next" type="button">Next</button>
					<button type="submit" class="submit" style='display: none;'>Submit</button>
				</div>
			</div>
			<div class="panel__item">
				<div class="indicator">
					<div class="indicator-crumb">
						<span class="indicator-current">1</span>
						<span>/</span>
						<span class="indicator-total">0</span>
					</div>
					<div class="progress-indicator">
						<span></span>
					</div>  
				</div>
			</div>`
		$form.appendChild(slidePanelParent)
	}

	//show_if
	const showIfTypes=['select','input[type=radio]','input[type=checkbox]'];
	const qs=showIfTypes.map(t => `#${formId} ${t}`).join(',');
	const $inputs=Array.from(document.querySelectorAll(qs));
	$inputs.forEach($input => {
		$input.addEventListener('change', evt => {
			hideConditionals($inputs, output, $form);
		})
	})
	hideConditionals($inputs, output, $form);
}

function hideConditionals($inputs, formDefinition, $form) {
	const values=$inputs.map($i => {
		if (($i.type=='checkbox' || $i.type=='radio')  && !$i.checked) return null;
		return $i.value;
	})
	formDefinition.forEach(item => {
		if (item.show_if) {
			const showIfValues=csvOrLinesToArray(item.show_if);
			let match=false;
			showIfValues.forEach(val => {
				if (values.includes(val)) match=true;
			})
		const qs='.radio-el, .select-el, .input-el';
		const $div=$form.querySelector(`[name="${item.name}"]`).closest(qs);
		if (match) $div.classList.remove('hidden');
		else $div.classList.add('hidden');
		}
	})
}

function customValidate() {
	const qs='.radio-el.hidden, .select-el.hidden, .input-el.hidden';
	const $hiddenEls=$form.querySelectorAll(qs);
	$hiddenEls.forEach($div => {
		$div.querySelectorAll('[required]').forEach($r => {
			console.log($r);
			$r.removeAttribute('required')
		});
	})

	const $requiredCheckboxes=$form.querySelectorAll('.checkboxes.required');
	$requiredCheckboxes.forEach($div => {
		console.log($div);
		console.log (`hidden:${$div.classList.contains('hidden')} checked:${$div.querySelector('input:checked')}`);
		if (!$div.classList.contains('hidden') && !$div.querySelector('input:checked')) {
			// needs to be filled in
			$div.querySelector('input[type=checkbox]').setCustomValidity('Please select at least one checkbox.');
		} else {
			$div.querySelector('input[type=checkbox]').setCustomValidity('');
		}
	})

}

async function instructor() {
	const formId='wg-form'
	await createForm(formId);
	if(hasPageBreak) {
		let tag = document.createElement("script");
		tag.src = "/templates/default/slider-form.js";
		document.getElementsByTagName("body")[0].appendChild(tag);
	}


	setupForm({
		formId, preValidation: customValidate
	})

}

instructor();