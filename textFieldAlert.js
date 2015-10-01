
function createTextFieldAlert(data) {
	var win = Ti.UI.createWindow({
		backgroundColor: '#99000000',
	});
	
	var wrapperView = Ti.UI.createView({
		backgroundColor: 'white',
		borderRadius: 5,
		height: '30%',
		width: '90%',
		top: '20%',
	});
	
	var title = Ti.UI.createLabel({
		text: data.title || 'Alert',
		font: {fontSize: 17, fontWeight: 'bold'},
		top: '10%',
	});
	
	/* Description label */
	var message = Ti.UI.createLabel({
		text: data.message || '',
		font: {fontSize: 16},
		top: '25%',
	});
	
	var error = Ti.UI.createLabel({
		text: data.error || 'This field cannot be left blank.',
		font: {fontSize: 14},
		color: 'red',
		top: '40%',
		left: '8%'
	});
	
	var textField = Ti.UI.createTextField({
		top: '50%',
		height: 'auto',
		width: '85%',
		borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
		font: {fontSize: 16},
		value: data.text || '',
	});
	
	textField.addEventListener('return', function() {
		done.fireEvent('click');
	});
	
	/* Button Views */
	var done = Ti.UI.createButton({
		bottom: 0,
		right: 0,
		title: 'Done',
		height: '25%',
		width: '50%',
		backgroundColor: 'white',
	});
	
	var cancel = Ti.UI.createButton({
		bottom: 0,
		left: 0,
		title: 'Cancel',
		height: '25%',
		width: '50%',
		backgroundColor: 'white',
	});
	
	done.addEventListener('click', function() {
		if (!textField.value.trim()) {
			error.show();
			return;
		}
		
		if (data.callback && data.text != textField.value.trim()) {
			data.callback(textField.value.trim());
		}
		
		close();
	});
	
	cancel.addEventListener('click', function() {
		close();
	});
	
	/* Body Views */
	var borderHorizontal = Ti.UI.createView({
	    backgroundColor: '#a7a7a9',
	    height: 1,
	    left: 0,
	    bottom: '25%'
	});
	
	var borderVertical = Ti.UI.createView({
		backgroundColor: '#a7a7a9',
	    width: 1,
	    left: '50%',
	    top: '75%'
	});
	
	wrapperView.add(title);
	wrapperView.add(message);
	wrapperView.add(error);
	wrapperView.add(textField);
	wrapperView.add(done);
	wrapperView.add(cancel);
	
	wrapperView.add(borderHorizontal);
	wrapperView.add(borderVertical);
	
	error.hide();
	
	win.add(wrapperView);
		
	function close() {
		win.close();
		win.destroy;
	}
	
	win.open({animate: true});
	textField.focus();
	
	return win;
}

exports.createTextFieldAlert = createTextFieldAlert;
