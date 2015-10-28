function createCheckboxButtonGroup(args) {
	var data = args || {};
	
	var view = Ti.UI.createView();
	
	// can't set values as a property of view...
	var values =  {};
		
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
			hasCheck: false,
			
			title: data.text,
			color: data.color || '#000',
			left: '5%',
			
			callback: data.callback,
		});
		
		if (data.font != null) {
			tableViewRow.font = data.font;
		}
		
		tableView.appendRow(tableViewRow);
		
		if (data.value) {
			tableViewRow.hasCheck = true;
		}	
		
		values[data.id] = data.value;
	};
	
	view.deleteOption = function(id) {
		var rows = tableView.data[0].rows;
		
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].id == id) {
				tableView.deleteRow(rows[i]);
				
				delete values[id];
				
				break;
			}	
		}
	};
	
	view.getSelectedOptions = function() {
		var selected = [];
		
		for (var id in values) {
			if (values[id])
				selected.push(id);
		}
		
		return selected;
	};
	
	view.getValue = function(id) {
		return values[id];
	};
	
	view.add(tableView);
	
	view.addEventListener('click', function(e) {
		if (data.clickDisabled)
			return;
		
		if (e.rowData.hasCheck) {
			e.rowData.hasCheck = false;
			values[e.rowData.id] = false;
		} else {
			e.rowData.hasCheck = true;
			values[e.rowData.id] = true;
		}
		
		if (e.rowData.callback) {
			e.rowData.callback(e.rowData.id, values[e.rowData.id]);
		}
	});
	
	// if input group data is passed on initialization, insert buttons
	if (data.inputGroup) {
		for (var i = 0; i < data.inputGroup.length; i++) {
			view.insertOption(data.inputGroup[i]);
		}
	}
	
	return view;
}

exports.createCheckboxButtonGroup = createCheckboxButtonGroup;
