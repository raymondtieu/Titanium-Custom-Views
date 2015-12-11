/* 
 * Titanium TextArea with hintText property for iOS 
 * Default keyboard toolbar with done button
 */
function createTextArea(args) {
	var data = args || {};
	
	var textArea = Ti.UI.createTextArea();
	
	var done = Ti.UI.createButton({
		systemButton: Ti.UI.iPhone.SystemButton.DONE
	});
	
	var flexSpace = Ti.UI.createButton({
		systemButton: Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});
	
	done.addEventListener("click", function() {
		textArea.blur();
	});
	
	textArea.keyboardToolbar = [flexSpace, done];
	
	setProperties(textArea, data);
	
	if (data.hintText !== undefined && data.hintText.trim() !== "") {
		var hintText = Ti.UI.createLabel({
			color: "c7c7cd",
			top: 8,
			left: 5,
			text: data.hintText,
			font: data.font,
			
			bubbleParent: true,
			touchEnabled: false
		});
		
		textArea.add(hintText);
		
		textArea.addEventListener("change", function() {
			if (this.value === "") {
				hintText.show();
			} else {
				hintText.hide();
			}
		});
		
		if (textArea.value !== "") {
			hintText.hide();
		}
	}
	
	textArea.setValue = function(value) {
		if (value !== "") {
			textArea.value = value;
			hintText.hide();
		} else {
			hintText.show();
		}
	};
	
	return textArea;
}

function setProperties(view, options) {
	for (var p in options)
		view[p] = options[p];
}

exports.createTextArea = createTextArea;
