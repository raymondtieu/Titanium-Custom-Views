/* This helper file is used to make recording, pausing, playing and stopping
 * sound files easier using Titanium.
 * 
 * Files can also be renamed and deleted.
 */
function getAudioManager(args) {
	var data = args || {};
	
	var ext = data.ext || '.wav';
	
	Titanium.Media.audioSessionCategory = Ti.Media.AUDIO_SESSION_MODE_PLAY_AND_RECORD;
	var recording = Ti.Media.createAudioRecorder();
	
	// default compression is Ti.Media.AUDIO_FORMAT_LINEAR_PCM
	// default format is Ti.Media.AUDIO_FILEFORMAT_CAF
	
	// this will give us a wave file with µLaw compression which
	// is a generally small size and suitable for telephony recording
	// for high end quality, you'll want LINEAR PCM - however, that
	// will result in uncompressed audio and will be very large in size
	recording.compression = Ti.Media.AUDIO_FORMAT_ULAW;
	recording.format = Ti.Media.AUDIO_FILEFORMAT_WAVE;
	
	Ti.Media.addEventListener('recordinginput', function(e) {
		Ti.API.info('Input availability changed: '+e.available);
		if (!e.available && recording.recording) {
			b1.fireEvent('click', {});
		}
	});
	
	var file;
	var timer;
	var sound;
	var duration;

	this.init = function() {
		file = null;
		timer = null;
		sound = null;
		duration = 0;	
	};
		

	this.record = {
		start: function(args) {
			Titanium.Media.audioSessionCategory = Ti.Media.AUDIO_SESSION_CATEGORY_RECORD;
			
			var data = args || {};
			
			var isRecording = false;
			
			if (!recording.recording && Ti.Media.canRecord) {
				recording.start();
				Ti.Media.startMicrophoneMonitor();
				
				timer = setInterval(incrementDuration, 1000);
				
				Ti.API.info("Recording now...");
				
				isRecording = true;
			} else if (recording.recording) {
				Ti.API.info("Already started recording.");
				
				isRecording = true;
			} else {
				Ti.UI.createAlertDialog({
					title:'Error!',
					message:'No audio recording hardware is currently connected.'
				}).show();
			}
			
			if (data.callback !== undefined)
				data.callback({isRecording: isRecording});
		},

		stop: function(args) {
			var data = args || {};
			
			if (recording.recording) {
				file = recording.stop();
				Ti.Media.stopMicrophoneMonitor();
				
				clearInterval(timer);
				
				Ti.API.info("Stopped recording");
				
				var defaultName = 'Recording_' + (new Date()).toISOString().replace(/[^0-9\-:]/g, "_").slice(0, -5);	// remove miliseconds
				var name = data.name || defaultName;
				
				var r = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, name + ext);
				
				if (r.exists()) {
					var alert = Titanium.UI.createAlertDialog({
					    title: 'File Already Exists',
					    message: 'A recording named “' + name + '” already exists. Do you want to replace it with the one you’re saving?',
					    buttonNames: ['Replace', 'Keep Both', 'Cancel'],
					    cancel: 2
					});
					
					alert.addEventListener('click', function(f) {
						//Clicked cancel, first check is for iphone, second for android
						if (f.cancel === f.index || f.cancel === true)
							return;
			
						switch (f.index) {
							case 0: 	// Replace
								Ti.API.info("Overwrite recording: " + name + ext);
								r.deleteFile();
								
								r.write(file.toBlob);
								break;
							
							case 1:		// Keep both
								name += findNextCopy(name, ext);
								Ti.API.info("Saving recording: " + name + ext);
								
								r = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, name + ext);
								
								r.write(file.toBlob);
								break;
			 				default:
			 					break;
						}
					});
				 
					alert.show();
				} else {
					Ti.API.info("Saving recording: " + name + ext + " of size: " + file.size);
					r.write(file.toBlob);
				}
				
				if (data.callback !== undefined)
					data.callback({success: true, recording: name, duration: duration});
				
				return;
			} else {
				Ti.API.info("Not recording anything.");
			}
			
			if (data.callback !== undefined)
				data.callback({success: false});
		},

		pause: function(args) {
			var data = args || {};

			if (!recording)
				return 0;
			
			if (recording.paused) {
				Ti.API.info("Resuming...");
				recording.resume();
				
				timer = setInterval(incrementDuration, 1000);
			} else {
				Ti.API.info("Pausing...");
				recording.pause();
				
				clearInterval(timer);
			}
			
			if (data.callback !== undefined)
				data.callback({pause: recording.getPaused()});
		},

		getDuration: function() {
			return duration;
		},
	};

	this.playback = {
		start: function(args) {
			Titanium.Media.audioSessionCategory = Ti.Media.AUDIO_SESSION_CATEGORY_PLAYBACK;
			
			var data = args || {};
			
			var r = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, data.name + ext);
			
			if (r.exists()) {
				if (sound && sound.playing) {
					Ti.API.info("Playback already started");
				} else {
					Ti.API.info("starting playback");
					
					sound = Titanium.Media.createSound({url: r});
					
					sound.addEventListener('complete', function() {
						if (data.complete !== undefined)
							data.complete({success: true});
					});
					
					sound.play();
					
					if (data.playback !== undefined)
						data.playback({success: true});
				}
			} else {
				var err = 'No file with name "' + data.name + '" was found.';
				if (data.error !== undefined) {
					data.error({error: err});
				} else {
					Ti.UI.createAlertDialog({
						title:'Error!',
						message: err,
					}).show();
				}
			}
		},

		stop: function(args) {
			var data = args || {};
			
			if (sound && sound.playing) {
				Ti.API.info("Stopping playback");
				sound.stop();
				sound.release();
				sound = null;
				
				if (data.callback !== undefined)
					data.callback({playback: false});
			} else {
				Ti.API.info("Nothing to stop");
			}
		},

		pause: function(args) {
			var data = args || {};

			if (!sound)
				return 0;
			
			var isPaused = false;
			
			if (sound.isPaused()) {
				Ti.API.info("Resuming...");
				sound.play();
			} else {
				Ti.API.info("Pausing...");
				sound.pause();
				
				isPaused = true;
			}
			
			if (data.callback !== undefined)
				data.callback({pause: isPaused});
		},
	};
	
	this.renameFile = function(args) {
		var data = args || {};
		
		var original = data.original;
		var new_name = data.new_name;
		
		var rename = false;
		
		var r = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, original + ext);
		if (r.exists()) {
			Ti.API.info("Renaming");
			
			rename = r.rename(new_name + ext);
			
			if (rename) {
				Ti.API.info("Renaming successful");
    		} else {
    			Ti.API.info("Renaming failed");
    		}	      
    		
    		if (data.callback !== undefined) {       		
	        	data.callback({success: rename});
	       	}  
		} else {
			var err = 'No file with name "' + original + '" was found.';
			
			if (data.callback !== undefined) {
				data.callback({success: false, error: err});
			} else {
				Ti.UI.createAlertDialog({
					title:'Error!',
					message: err,
				}).show();
			}
		}		
	};
	
	this.deleteFile = function(args) {
		var data = args || {};
		
		if (data.name) {
			var r = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, data.name + ext);
			
			if (r.exists()) {
				Ti.API.info("Deleting");
				var result = r.deleteFile();
				
				if (data.callback !== undefined)
					data.callback({success: result});
				
			} else {
				var err = 'No file with name "' + data.name + '" was found.';
				
				if (data.callback !== undefined) {
					data.callback({success: false, error: err});
				} else {
					Ti.UI.createAlertDialog({
						title:'Error!',
						message: err,
					}).show();
				}
			}
		} else {
			Ti.UI.createAlertDialog({
				title:'Error!',
				message:'No file name.',
			}).show();
		}
	};
	
	function incrementDuration() {
		duration++;
	}

	this.init();
	
	return this;
}

exports.getAudioManager = getAudioManager;


// Finds next available number to append when saving recordings of same name
function findNextCopy(name, ext) {
	var appDir = Titanium.Filesystem.getApplicationDataDirectory();
    var dir = Titanium.Filesystem.getFile(appDir);
    var dir_files = dir.getDirectoryListing();
    
    Ti.API.info("dir_files: " + dir_files);
    
    var k = 2;

	// pattern to look for matching files of the form name(number).extension
	//    /^name(\(\d+\))?.wav$/
	var s = '^' + name +'(\\(\\\d+\\))?' + ext + '$';
	var re = new RegExp(s);
    
    for (var i in dir_files) {
    	var fname = dir_files[i].toString();
    	
    	if (re.test(fname)) {
    		// match the (number) suffix on the filename
	    	var suffix = /\(\d+\)/g;
	    	
	    	// match the number of the suffix;
	    	var suffixNum = /[\(\)]/g;
	    	
	    	Ti.API.info("MATCHED: " + fname);
	    	
	    	var n = 0;
	    	
	    	var s = fname.match(suffix);
	    	if (s !== null) {
	    		n = parseInt(s.pop().replace(suffixNum, ''));
	    	}
	    	
	    	if (k <= n) {
	    		k = n + 1;
	    	}
    	}
    }
    
    return '(' + k + ')';
}

