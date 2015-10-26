
function createCollapsibleTableView() {
	var view = Ti.UI.createView({
	});
	
	var tableView = Ti.UI.createTableView({
		height: Ti.UI.FILL,
		layout: 'vertical',
		backgroundColor: 'transparent',
		rowHeight: 40,
	});
	
	/* View methods */
	view.insertParent = function(data) {
		//Ti.API.info("Inserting parent: " + JSON.stringify(data));
		
		var tableViewRow = Ti.UI.createTableViewRow({
			id: data.id,
			isParent: true,
			isExpanded: false,
			childRows: [],
		});
		
		for (var i = 0; i < data.views.length; i++) {
			tableViewRow.add(data.views[i]);
		}
		
		
		// set table view row style
		if (data.style) {
			setStyle(tableViewRow, data.style);
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
			
			for (var j = 0; j < data.views.length; j++) {
				tableViewRow.add(data.views[j]);
			}
			
			// set table view row style
			if (data.style) {
				setStyle(tableViewRow, data.style);
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
	
	view.add(tableView);
	
	return view;
}

function setStyle(tableViewRow, style) {
	if (style.backgroundColor)
		tableViewRow.backgroundColor = style.backgroundColor;
	
	if (style.height)
		tableViewRow.height = style.height;
		
	if (style.rightImage)
		tableViewRow.rightImage = style.rightImage;
		
	if (style.leftImage)
		tableViewRow.leftImage = style.leftImage;
}

exports.createCollapsibleTableView = createCollapsibleTableView;
