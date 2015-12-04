/**
 * Opens a modal window with a picker (to be used with date pickers)
 * @param {Object} args - arguments given to the modal window
 * @param {string} args.windowBackgroundColor - background color for the window, default is transparent
 * @param {string} args.datePickerType - type of picker, default is Titanium.UI.PICKER_TYPE_DATE
 * @param {string} args.date - value of the picker on open, default is now
 * @callback args.callback - callback function given the value of the picker when the done button or views outside of the modal are pressed
 */
function createPickerModal(args) {
	var data = args || {};
	
	var win = Ti.UI.createWindow({
		statusBarStyle: Ti.UI.iPhone.StatusBar.OPAQUE_BLACK,
		backgroundColor: data.windowBackgroundColor || "transparent",
		bottom: "-100%",
	});
	
	var done = Ti.UI.createButton({
		title: L("done"),
		top: 4,
		right: "12%"
	});
	
	var cancel = Ti.UI.createButton({
		title: L("cancel"),
		top: 4,
		left: "12%",
	});
	
	var wrapper = Ti.UI.createView({
		height: 265,
		backgroundColor: "f9f9f9",
		bottom: 0,
		bubbleParent: false,
	});
	
	var divider = Ti.UI.createView({
		height: 37,
		top: 0,
		width: "120%",
		borderWidth: 1,
		borderColor: "b2b2b2",
		//backgroundColor: "b2b2b2",
	});
	
	var picker = Ti.UI.createPicker({
		type: data.datePickerType || Titanium.UI.PICKER_TYPE_DATE,
		bubbleParent: false,
		bottom: 0,
	});
	
	picker.value = data.date || new Date();
	
	divider.add(done);
	divider.add(cancel);
	wrapper.add(divider);
	wrapper.add(picker);
	win.add(wrapper);
	
	var animSlideUp = Ti.UI.createAnimation({
		duration: 250,
		bottom: "0%",
	});
	
	var animSlideDown = Ti.UI.createAnimation({
		duration: 250,
		bottom: "-100%",
	});

	
	// dismiss window on press event outside picker
	win.addEventListener("click", function() {
		closeWin();
	});
	
	done.addEventListener("click", function() {
		closeWin();
	});
	
	cancel.addEventListener("click", function() {
		win.close(animSlideDown);
	});
	
	function closeWin() {
		if (data.callback !== undefined) {
			data.callback(picker.value);
		}
		
		win.close(animSlideDown);
	}
	
	win.open(animSlideUp);
}

exports.createPickerModal = createPickerModal;

