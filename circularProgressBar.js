var defaults = {
	diameter: 150,
	empty: "b6b6b6",
	fill: "388e3c",
	max: 360,
	
	// inner view
	backgroundColor: "white",
};

function createCircularProgressBar(args) {
	var data = args || {};
	
	var value = 0;
	
	var background = Ti.UI.createView({
		height: data.diameter || defaults.diameter,
		width: data.diameter || defaults.diameter,
		backgroundColor: data.fill || defaults.fill,
	});
	background.borderRadius = background.height / 2;
	
	var leftCover = Ti.UI.createView({
		height: background.height,
		width: "50%",
		left: 0,
		backgroundColor: data.empty || defaults.empty,
		anchorPoint: {x: 1, y: 0.5},
	});
	
	var leftBackground = Ti.UI.createView({
		height: background.height,
		width: "50%",
		left: 0,
		backgroundColor: data.fill || defaults.fill,
		visible: false,
	});
	
	var rightCover = Ti.UI.createView({
		height: background.height,
		width: "50%",
		right: 0,
		backgroundColor: data.empty || defaults.empty,
		anchorPoint: {x: 0, y: 0.5},
	});
	
	var rightBackground = Ti.UI.createView({
		height: background.height,
		width: "50%",
		right: 0,
		backgroundColor: data.fill || defaults.fill,
		visible: false,
	});

	background.add(leftCover);
	background.add(rightCover);
	background.add(leftBackground);
	background.add(rightBackground);
	
	var inner;
	
	// Add inner view
	if (data.thickness !== undefined && data.thickness > 0) {
		inner = Ti.UI.createView({
			height: background.height - (data.thickness || defaults.thickness),
			width: background.height - (data.thickness || defaults.thickness),
			backgroundColor: data.backgroundColor || defaults.backgroundColor,
		});
		
		inner.borderRadius = inner.height / 2;
		
		background.add(inner);
	}
	
	function convertToDegrees(v) {
		return Math.round((v / (data.max || defaults.max)) * defaults.max);
	}

	// No animation yet
	background.setValue = function(v, callback) {
		var degrees = convertToDegrees(v);
		
		console.log(degrees);
		
		// Counter clockwise progress bar
		if (data.clockwise !== undefined && !data.clockwise) {
			rightCover.visible = degrees <= 180;
			leftBackground.visible = degrees > 180;
			leftCover.transform = Ti.UI.create2DMatrix().rotate(-1 * degrees);
		} else {
		// Clockwise
			leftCover.visible = degrees <= 180;
			rightBackground.visible = degrees > 180;
			rightCover.transform = Ti.UI.create2DMatrix().rotate(degrees);
		}

		value = v;
		
		if (callback !== undefined) {
			callback(value);
		}
	};
	
	background.getValue = function() {
		return value;
	};
	
	background.getInnerView = function() {
		return inner;
	};

	return background;
}

exports.createCircularProgressBar = createCircularProgressBar;
