const ngrok_url = "http://2ec5-105-226-150-99.ngrok.io";
const auth_token = "CiVodHRwczovL3RyaW5zaWMuaWQvc2VjdXJpdHkvdjEvb2Jlcm9uEkwKKnVybjp0cmluc2ljOndhbGxldHM6VW45TGpFNUVjN0ZCUFRvNzFURFpVQSIedXJuOnRyaW5zaWM6ZWNvc3lzdGVtczpkZWZhdWx0GjCAevCcnadUa3HuncGb_YN6BFwU-jgBzgZZHR4hABloaRWyEVo2T1uqFz0lOTWSrf0iAA"
let select_template_id = null;

// ------------------------------
// on load
$(document).ready(function () { 
	$( "#modal_load" ).load( "modal.html" );
	// create dropdown of template ids
	get_credentials_for_wallet();
});

var clipboard = new ClipboardJS('.copy-btn');

clipboard.on('success', function(e) {
    console.info('Action:', e.action);
    console.info('Text:', e.text);
    console.info('Trigger:', e.trigger);
		// document.execCommand("copy");
		navigator.clipboard.writeText(e.text);

    // e.clearSelection();
});

clipboard.on('error', function(e) {
    console.error('Action:', e.action);
    console.error('Trigger:', e.trigger);
});

// ------------------------------
async function get_credentials_for_wallet() {
	let data = {};

	data['auth_token'] = auth_token;
	
	data['query'] =  "SELECT c.id, c.type, c.data FROM c";

	$.ajax({
		dataType: 'json',
		data: data,
		url: `${ngrok_url}/searchWallet`,
		type: "POST",
		success: function (result) {
			console.log(result);
			const arr = parse_items(result.items);
			
			load_table(arr);
		},
		error: function(result) {
			show_modal('Error', 'Server could not complete request.');
		}
	});
}


// ------------------------------
function parse_items(data) {
	let arr = [];
	
	for(item in data) {
		let obj = JSON.parse(data[item]);
		arr.push(obj);
	}

	return arr;
}

// ------------------------------
function load_table(data) {
	$('#list_credentials').bootstrapTable('destroy').bootstrapTable({
		data: data,
		// dataToggle: true,
		// dataDetailView: true,
  	// dataDetailViewIcon: true,
		// dataDetailFormatter: function (index, row) {
		// 	var html = []
			
		// 	$.each(row, function (key, value) {
		// 		html.push('<p><b>' + key + ':</b> ' + value + '</p>')
		// 	})
			
		// 	return html.join('')
		// },
		columns: [
			[{
				field: 'id',
				title: 'Credential Id',
				formatter: function(value, row) {
					return "<a href='javascript:void(0)' class='view_credential'>" + value + "<a>";
				},
				events: window.operateEvents,
			}, 
			{
				field: '',
				title: 'Actions',
				align: 'center',
				events: window.operateEvents,
				formatter: function(){
					let arr = [];

					arr.push("<button class='btn btn-primary btn-sm generate_proof'>Generate Proof</button>");
					
					return arr.join("");
					// display action buttons
					// create credential proof
				}
			}]
		]
	})
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
				console.log(result);
				show_copy_modal('Credential Proof', JSON.stringify(result), function(data) {
					// copyToClipboard(data);
				});
			},
			error: function(result) {
				show_modal('Error', 'Server could not complete request.');
			}
		});
	},
	'click .view_credential': function (e, value, row, index) {
		console.log(row);
		show_modal('Credential', JSON.stringify(row.data));
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
function show_copy_modal(header, body, callback) {
	$("#copy_modal_header")[0].innerHTML = header;
	$("#copy_modal_body")[0].innerHTML = "<p>" + body + "</p>";
	$("#copy_button").attr("data-clipboard-text", body);
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