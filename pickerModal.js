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
		systemButton: Ti.UI.iPhone.SystemButton.DONE
	});
	
	var cancel = Ti.UI.createButton({
		systemButton: Ti.UI.iPhone.SystemButton.CANCEL
	});
	
	var flexSpace = Ti.UI.createButton({
		systemButton: Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});
	
	var toolbar =  Titanium.UI.iOS.createToolbar({
	    items:[cancel, flexSpace, done],
	    top: 50, // Border doesn't appear with top: 0
	    borderTop: true,
	    borderBottom: false,
	    height: Ti.UI.SIZE
	}); 
	
	var wrapper = Ti.UI.createView({
		height: Ti.UI.SIZE,
		bottom: 0,
		layout: "vertical"
	});
	
	var picker = Ti.UI.createPicker({
		type: data.datePickerType || Titanium.UI.PICKER_TYPE_DATE,
		bubbleParent: false,
		bottom: 0,
	});
	
	picker.value = data.date || new Date();
	
	wrapper.add(toolbar);
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

