
function createModalTextArea(data) {
	var win = Ti.UI.createWindow({
		backgroundColor: '#70aaaaaa',
	});
	
	var wrapperView = Ti.UI.createView({
		backgroundColor: '#f0eff4',
		borderRadius: 2,
		height: '40%',
		width: '90%',
		top: '15%',
	});
	
	var headerView = Ti.UI.createView({
		backgroundColor: '#f7f7f7',
		height: '12%',
		width: '100%',
		top: 0
	});
	
	var bodyView = Ti.UI.createView({
		backgroundColor: 'transparent',
		top: '12%',
	});
	
	/* Header Views */
	var title = Ti.UI.createLabel({
		text: data.title || '',
		font: {fontSize: 16},
		top: '20%',
	});
	
	var done = Ti.UI.createButton({
		top: '0%',
		right: '5%',
		title: 'Done',
	});
	
	var cancel = Ti.UI.createButton({
		top: '0%',
		left: '5%',
		title: 'Cancel',
	});
	
	done.addEventListener('click', function() {
		if (!textArea.value.trim()) {
			alert(data.alertMsg || "This field cannot be left empty.");
			hintLabel.show();
			return;
		}
		
		if (data.callback && data.text != textArea.value.trim()) {
			data.callback(textArea.value.trim());
		}
		
		close();
	});
	
	cancel.addEventListener('click', function() {
		close();
	});
	
	/* Body Views */
	var borderTop = Ti.UI.createView({
	    backgroundColor: '#a7a7a9',
	    height: 1,
	    left: 0,
	    top: 0,
	    right: 0
	});
	
	// hint text property in text area does not work
	var hintLabel = Ti.UI.createLabel({
		text: data.hintText || '',
		font: {fontSize: 16},
		color: '#c8c7cc',
		top: '8%',
		left: '7%'
	});
	
	var textArea = Ti.UI.createTextArea({
		borderWidth: 1,
		borderColor: '#c8c7cc',
		borderRadius: 5,
		returnKeyType: Ti.UI.RETURNKEY_GO,
		suppressReturn: false,
		textAlign: 'left',
		top: '7%', 
		width: '90%',
		height: '84%',
		font: {fontSize: 16},
		
		value: data.text || '',
	});
	
	textArea.addEventListener('focus', function() {
		if (this.value.trim() == '') {
			hintLabel.hide();
		}
	});
	
	// hide the hint text if text has been passed in as an argument
	if (data.text) {
		hintLabel.hide();
	}

	headerView.add(title);
	headerView.add(done);
	headerView.add(cancel);
	
	bodyView.add(borderTop);
	bodyView.add(textArea);
	bodyView.add(hintLabel);
	
	wrapperView.add(headerView);
	wrapperView.add(bodyView);
	
	win.add(wrapperView);
		
	function close() {
		win.close();
		win.destroy;
	}
	
	win.open({animate: true});
	
	return win;
}

exports.createModalTextArea = createModalTextArea;
