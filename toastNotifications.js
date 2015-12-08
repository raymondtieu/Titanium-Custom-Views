function createToast(args) {
	var data = args || {};
	
	var style = {
		padding: 15,
		paddingSides: 25,
		color: 'white',
		backgroundColor: "#99000000",
		borderRadius: 25,
		
		height: Ti.UI.SIZE,
		width: Ti.UI.SIZE,
		maxWidth: '90%',
		bottom: "10%",
		
		textAlign: 'center',
	};
	
	var timeout = 1500;
	
	if (data.timeout !== undefined)
		timeout = data.timeout;
		
	var msgWin = Ti.UI.createWindow({
		height: style.height,
		width: style.maxWidth,
		bottom: style.bottom,
		touchEnabled: false,
		statusBarStyle: Ti.UI.iPhone.StatusBar.OPAQUE_BLACK,
	});
	
	var msgView = Ti.UI.createView({
		height: style.height,
		width: style.width,

		backgroundColor: style.backgroundColor,
		borderRadius: style.borderRadius,
	});
	
	var msgLabel = Ti.UI.createLabel({
		top: style.padding,
		bottom: style.padding,
		left: style.paddingSides,
		right: style.paddingSides,
		
		height: style.height,
		width: style.width,
		
		color: style.color,
		
		textAlign: style.textAlign,
		
		text: (data.text ? data.text.trim() : 'This is a toast message.'),
		
		font: {
			fontSize: 14,
		}
	});
	
	msgView.add(msgLabel);
	msgWin.add(msgView);
	
	this.setText = function(text) {
		msgLabel.text = text.trim();
		
		return this;
	};
	
	this.getText = function(text) {
		return data.text; 
	};
	
	this.show = function() {
		msgWin.open();
		
		setTimeout(function() {
			msgWin.close({
				opacity: 0,
				duration: 750,
			});
		}, timeout);
	};
	
	return this;
}

exports.createToast = createToast;
