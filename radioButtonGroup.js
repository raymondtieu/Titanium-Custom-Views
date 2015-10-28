var ON = '\u2022';	// bullet character
var OFF = '';

var radioSpec = {
	title: OFF,
	right: 15,
	width: 20,
	height: 20,
	borderColor: "#bbb",
	borderWidth: 1,
	borderRadius: 10,
	backgroundColor: "#fff",
	backgroundImage: 'none',
	color: "#007aff",
	font: {fontSize: 30, fontWeight: "bold"},
	value: false
};

function createRadioButtonGroup(args) {
	var data = args || {};
	
	var view = Ti.UI.createView();
	
	var selected;
		
	var tableView = Ti.UI.createTableView({
		height: Ti.UI.FILL,
		layout: 'vertical',
		backgroundColor: 'transparent',
		rowHeight: 40,
		footerTitle: '',	// truncate table
	});
	
	if (data.scrollable !== undefined)
		tableView.scrollable = data.scrollable;
	
	if (data.separatorColor !== undefined)
		tableView.separatorColor = data.separatorColor;
	
	/* View functions */
	view.insertOption = function(data) {		
		var tableViewRow = Ti.UI.createTableViewRow({
			id: data.id,
						
			callback: data.callback,
		});
		
		var label = Ti.UI.createLabel({
			text: data.text,
			color: '#000',
			left: '5%',
			color: data.color || '#000',
		});
		
		if (data.font !== undefined) {
			label.font = data.font;
		}
		
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
			selected = data.id;
			this.on(data.id);
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
		if (data.clickDisabled)
			return;
		
		if (e.rowData.btn.value) {
			view.off(e.rowData.id);
		} else {
			view.on(e.rowData.id);
		}
		
		if (e.rowData.callback) {
			e.rowData.callback(e.rowData.id, view.getValue(e.rowData.id));
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
