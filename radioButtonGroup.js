var ON = '\u2022';	// bullet character
var OFF = '';

var radioSpec = {
	title: OFF,
	top: 5,
	right: 15,
	width: 30,
	height: 30,
	borderColor: "#bbb",
	borderWidth: 1,
	borderRadius: 15,
	backgroundColor: "#fff",
	backgroundImage: 'none',
	color: "#0053a6",
	font: {fontSize: 40, fontWeight: "bold"},
	value: false
};

function createRadioButtonGroup(data) {
	var data = data || {};
	
	var view = Ti.UI.createView({});
	
	var selected;
		
	var tableView = Ti.UI.createTableView({
		height: Ti.UI.FILL,
		layout: 'vertical',
		backgroundColor: 'transparent',
		rowHeight: 40,
	});
	
	/* View functions */
	view.insertOption = function(data) {		
		var tableViewRow = Ti.UI.createTableViewRow({
			id: data.id,
		});
		
		var label = Ti.UI.createLabel({
			text: data.text,
			color: '#000',
			left: '5%',
		});
		
		var btn = Ti.UI.createButton(radioSpec);	
		
		tableViewRow.btn = btn;
		
		tableViewRow.add(label);
		tableViewRow.add(btn);
		
		tableView.appendRow(tableViewRow);
		
		if (data.value) {			
			this.on(data.id);
		}	
		
		// 1 option is always selected
		if (selected == undefined) {
			selected = this.id;
		}
	};
	
	view.deleteOption = function(id) {
		var rows = tableView.data[0].rows;
		
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].id == id && selected != id) {
				rows[i].btn = null;
				tableView.deleteRow(rows[i]);
				
				break;
			}	
		}
	};
	
	view.getSelectedOption = function() {
		return selected;
	};
	
	view.getValue = function(id) {
		return id == selected;
	};
	
	view.on = function(id) {
		var rows = tableView.data[0].rows;
		
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].id == id) {
				rows[i].btn.title = ON;
				rows[i].btn.value = true;
				
				selected = id;
				
			} else {
				// turn off all other rows
				rows[i].btn.title = OFF;
				rows[i].btn.value = false;
			}
		}
	};
	
	view.off = function(id) {
		var rows = tableView.data[0].rows;
		
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].id == id && selected != id) {
				rows[i].btn.title = OFF;
				rows[i].btn.value = false;
			}	
		}
	};
	
	view.add(tableView);
	
	view.addEventListener('click', function(e) {
		if (e.rowData.btn.value) {
			view.off(e.rowData.id);
		} else {
			view.on(e.rowData.id);
		}
	});
	
	// if input group data is passed on initialization, insert options
	if (data.inputGroup) {
		for (var i = 0; i < data.inputGroup.length; i++) {
			view.insertOption(data.inputGroup[i]);
		}
	}
	
	return view;
}

exports.createRadioButtonGroup = createRadioButtonGroup;
