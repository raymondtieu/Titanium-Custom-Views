
var tableDefaults = {
	height: Ti.UI.FILL,
	layout: 'vertical',
	backgroundColor: 'transparent',
	rowHeight: 40,
	footerTitle: '',	// truncate table
};

function createCollapsibleTableView(args) {
	var data = args || {};
	
	var view = Ti.UI.createView();
	
	var tableView = Ti.UI.createTableView(tableDefaults);
	setProperties(tableView, data);
	
	/* View methods */
	view.insertParent = function(data) {
		//Ti.API.info("Inserting parent: " + JSON.stringify(data));
		
		var tableViewRow = Ti.UI.createTableViewRow({
			id: data.id,
			isParent: true,
			isExpanded: false,
			childRows: [],
		});
		
		if (data.views !== undefined) {
			for (var i = 0; i < data.views.length; i++)
				tableViewRow.add(data.views[i]);
			
		} else if (data.title !== undefined) {
			tableViewRow.title = data.title;
		}
		
		// set table view row style
		if (data.style) {
			setProperties(tableViewRow, data.style);
		}
		
		tableView.appendRow(tableViewRow);
	};
	
	view.insertChild = function(data) {
		//Ti.API.info("Inserting child: " + JSON.stringify(data));
		
		data.isParent = false;
	
		var rows = tableView.data[0].rows;
		
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].isParent && rows[i].id == data.parentID) {
				rows[i].hasChild = true;
				rows[i].childRows = rows[i].childRows.concat(data);
				
				break;
			}	
		}
	};
	
	view.expand = function(index, rowData) {
		//Ti.API.info("expanding " + rowData.childRows.length + " rows at index " + index);
		
		for (var i = 0; i < rowData.childRows.length; i++) {
			var data = rowData.childRows[i];
			
			var tableViewRow = Ti.UI.createTableViewRow({
				id: data.id,
				isParent: false,
				
				backgroundColor: "#20000000",	// black with 20% opacity
				
				callback: data.callback
			});
			
			if (data.views !== undefined) {
				for (var j in data.views)
					tableViewRow.add(data.views[j]);
				
			} else if (data.title !== undefined) {
				tableViewRow.title = data.title;
			}
			
			// set table view row style
			if (data.style) {
				setProperties(tableViewRow, data.style);
			}
			
			tableView.insertRowAfter(index + i, tableViewRow, {animationStyle: Ti.UI.iPhone.RowAnimationStyle.DOWN});
			
			// refresh data if last row is clicked due to errors with Titanium TableViews
			if (i == tableView.data[0].rowCount - 1)
				tableView.setData(tableView.data);
		}
		
		if (rowData.childRows.length) {
			rowData.isExpanded = true;
		
			tableView.scrollToIndex(index + 1);
		}
		
	};

	view.collapse = function(index, rowData) {
		//Ti.API.info("collapsing " + rowData.childRows.length + " rows at index " + index);
		
		for (var i = 0; i < rowData.childRows.length; i++) {
			tableView.deleteRow(index + 1, {animationStyle: Ti.UI.iPhone.RowAnimationStyle.DOWN});
			
			// refresh data if last row is clicked due to errors with Titanium TableViews
			if (i == tableView.data[0].rowCount - 1)
				tableView.setData(tableView.data);
		}
		
		if (rowData.childRows.length)
			rowData.isExpanded = false;
	};

	view.addEventListener('click', function(e) {	
		if (e.rowData.isParent) {
			if (e.rowData.isExpanded) {
				this.collapse(e.index, e.rowData);
			} else {
				this.expand(e.index, e.rowData);
			}
		} else {
			if (e.rowData.callback) {
				e.rowData.callback(e.rowData.id);
			}
		}
	});
	
	if (data.inputGroup !== undefined) {
		for (var i in data.inputGroup) {
			var parent = data.inputGroup[i];
			view.insertParent(parent);
			
			if (parent.children !== undefined) {
				for (var j in parent.children) {
					view.insertChild(parent.children[j]);
				}
			}
		}
	}
	
	view.add(tableView);
	
	return view;
}

function setProperties(view, options) {
	for (var p in options)
		view[p] = options[p];
}

exports.createCollapsibleTableView = createCollapsibleTableView;
