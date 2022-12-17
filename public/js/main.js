const ngrok_url = "http://53b9-105-186-223-181.ngrok.io";
const auth_token = "CiVodHRwczovL3RyaW5zaWMuaWQvc2VjdXJpdHkvdjEvb2Jlcm9uEkkKKnVybjp0cmluc2ljOndhbGxldHM6N1VwRmtIUEdvektWUWNFSHVLYVZ3TSIbdXJuOnRyaW5zaWM6ZWNvc3lzdGVtczpDU0lSGjCTwP0t3e2BdAKnkSjJIJN1HMwlexAmvYBUGBzR_DEFkGZebj-IdHu48JKhMrjBdegiAA"
let select_template_id = null;

// ------------------------------
// on load
$(document).ready(function () {
	$("#modal_load").load("modal.html");
	// create dropdown of template ids
	get_credentials_for_wallet();
});

var clipboard = new ClipboardJS('.copy-btn');

clipboard.on('success', function (e) {
	console.info('Action:', e.action);
	console.info('Text:', e.text);
	console.info('Trigger:', e.trigger);
	// document.execCommand("copy");
	navigator.clipboard.writeText(e.text);

	// e.clearSelection();
});

clipboard.on('error', function (e) {
	console.error('Action:', e.action);
	console.error('Trigger:', e.trigger);
});

// ------------------------------
async function get_credentials_for_wallet() {
	let data = {};

	data['auth_token'] = auth_token;

	data['query'] = "SELECT c.id, c.type, c.data FROM c";

	$.ajax({
		dataType: 'json',
		data: data,
		url: `${ngrok_url}/searchWallet`,
		type: "POST",
		success: function (result) {
			const arr = parse_items(result.items);

			load_table(arr);
		},
		error: function (result) {
			show_modal('Error', 'Server could not complete request.');
		}
	});
}


// ------------------------------
function parse_items(data) {
	let arr = [];

	for (item in data) {
		let obj = JSON.parse(data[item]);
		arr.push(obj);
	}

	return arr;
}

// ------------------------------
function load_table(data) {
	$('#list_credentials').bootstrapTable('destroy').bootstrapTable({
		data: data,
		search: "true",
		detailView: "true",
		showToggle: "true",
		showFullScreen: "true",
		pagination: "true",
		showPaginationSwitch: "true",
		detailFormatter: function (index, row) {
			let arr = []
			let data = row.data;
			console.log(typeof row.data);
		
			if (typeof row.data === 'string') {
				data = JSON.parse(row.data);
			}
		
			const list = loop_through_data(data, arr);
		
			return list.join('');
		},

		columns: [
			[{
				field: 'id',
				title: 'Credential ID',
				formatter: function (value, row) {
					return "<a href='javascript:void(0)' class='view_credential'>" + value + "</a>";
				},
				events: window.operateEvents,
			}]
		]
	})
}


// ------------------------------
async function get_credential_schema_data(index, row) {
		let arr = []

		let result = await $.get(data.credentialSchema[0].id, function (data, status) {
			return loop_through_data(data, arr);
		});

		console.log('get credential schema data', result.join(''));

		// arr.push('<div class="form-check form-switch">');
		// arr.push('<input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">');
		// arr.push('<label class="form-check-label" for="flexSwitchCheckDefault">Default switch checkbox input</label>');

		// arr.push('</div>');
}

// ------------------------------
function loop_through_data(data, arr) {
	$.each(data, function (key, value) {
		if (typeof value === 'object') {
			if(Array.isArray(value) && typeof value[0] == 'object') {

				arr.push('<p><b>' + key + ':</b></p>');

				// for credential schema traversal
				$.each(value[0], function (idx, val) {
					if (typeof idx === 'number') {
						arr.push('<li>' + val + '</li>')
					} else {
						arr.push('<li><u>' + idx + '</u>: ' + val + '</li>')
					}
				});

				//for objects in general
			} else {
				arr.push('<p><b>' + key + ':</b></p>');
				$.each(value, function (idx, val) {
					if (typeof idx === 'number') {
						arr.push('<li>' + val + '</li>')
					} else {
						arr.push('<li><u>' + idx + '</u>: ' + val + '</li>')
					}
				});
			}

			arr.push('<br/>')
		} else {		 
			arr.push('<p><b>' + key + ':</b> ' + value + '</p>')
		}
	})
	return arr;
}

// ------------------------------
window.operateEvents = {
	'click .generate_proof': function (e, value, row, index) {
		let data = {};
		data['auth_token'] = auth_token;
		data['credential_id'] = row.id;

		console.log(data);

		// todo: show spinner
		$.ajax({
			dataType: 'json',
			data: data,
			url: `${ngrok_url}/createCredentialProof`,
			type: "POST",
			success: function (result) {
				let arr = [];
				const json = JSON.parse(result["proofDocumentJson"]);
				const data = loop_through_data(json, arr);

				show_copy_modal('Credential Proof', result, data.join(""), function (data) {
					alert("Copied to clipboard");
					copyToClipboard(data);
				});
			},
			error: function (result) {
				show_modal('Error', 'Server could not complete request.');
			}
		});
	},
	'click .view_credential': function (e, value, row, index) {
		console.log(row);
		let arr = [];
		show_copy_modal('Copy Credential JSON-LD', row.data, loop_through_data(row.data, arr).join(""), function (data) {
			alert("Credential copied to clipboard");
			copyToClipboard(data);
		});
	}
}

// ------------------------------
// validate if input fields have values
function validate_form() {
	const credential_template_form = document.getElementById('show_fields')
	credential_template_form.classList.add('was-validated');

	if (credential_template_form.checkValidity() === false) {
		show_modal('Error', 'Please complete all input fields.');
		return false;
	}

	return true;
}


// ------------------------------
function show_modal(header, body) {
	$("#modal_header")[0].innerHTML = header;
	$("#modal_body")[0].innerHTML = "<p>" + body + "</p>";
	$("#modal").modal('show');
}

// ------------------------------
function show_copy_modal(header, raw_data, body, callback) {
	$("#copy_modal_header")[0].innerHTML = header;
	$("#copy_modal_body")[0].innerHTML = "<p>" + body + "</p>";
	$("#copy_button").attr("data-clipboard-text", JSON.stringify(raw_data));
	$("#copy_modal").modal('show');
	$("#copy_button").on("click", function (e, target, value) {
		callback(body);
	});
}

// ------------------------------
function show_confirmation_modal(header, body, confirm_callback) {
	$("#confirmation_modal_header")[0].innerHTML = header;
	$("#confirmation_modal_body")[0].innerHTML = "<p>" + body + "</p>";
	$("#confirmation_modal").modal('show');
	$("#modal_button_confirm").on("click", function (e) {
		confirm_callback();
		$("#confirmation_modal").modal('hide');
	});
}