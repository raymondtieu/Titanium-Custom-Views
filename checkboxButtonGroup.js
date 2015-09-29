var checkboxSpec = {
	top: 5,
	right: 15,
	width: 20,
	height: 20,
	borderWidth: 0,
	backgroundColor: 'transparent',
	backgroundImage: 'none',
	value: false
};

function createCheckboxButtonGroup(data) {
	var data = data || {};
	
	var image = data.imagePath;
	
	var view = Ti.UI.createView({});
	
	// can't set values as a property of view...
	var values =  {};
		
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
		
		var btn = Ti.UI.createButton(checkboxSpec);
		
		tableViewRow.btn = btn;
		
		tableViewRow.add(label);
		tableViewRow.add(btn);
		
		tableView.appendRow(tableViewRow);
		
		
		if (data.value) {			
			this.on(data.id);
		}	
		
		values[data.id] = data.value;
	};
	
	view.deleteOption = function(id) {
		var rows = tableView.data[0].rows;
		
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].id == id) {
				rows[i].btn = null;
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
	
	view.on = function(id) {
		var rows = tableView.data[0].rows;
		
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].id == id) {
				rows[i].btn.backgroundImage = image;
				
				rows[i].btn.value = true;
				
				values[rows[i].id] = true;
			}
		}
	};
	
	view.off = function(id) {
		var rows = tableView.data[0].rows;
		
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].id == id) {
				rows[i].btn.backgroundImage = 'none';
				rows[i].btn.value = false;
				
				values[rows[i].id] = false;
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
	
	// if input group data is passed on initialization, insert buttons
	if (data.inputGroup) {
		for (var i = 0; i < data.inputGroup.length; i++) {
			view.insertOption(data.inputGroup[i]);
		}
	}
	
	return view;
}

exports.createCheckboxButtonGroup = createCheckboxButtonGroup;
