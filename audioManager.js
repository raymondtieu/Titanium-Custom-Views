/**
 * This helper file is used to make recording, pausing, playing and stopping
 * sound files easier using Appcelerator.
 * 
 * Files can also be renamed and deleted.
 */

/**
 * Returns the audio manager with recording and playback functions
 * @param {Object} args - arguments given to the audio manager
 */
function getAudioManager(args) {
	var data = args || {};
	
	var ext = ".wav";
	
	Titanium.Media.audioSessionCategory = Ti.Media.AUDIO_SESSION_CATEGORY_PLAY_AND_RECORD;
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
		console.log('Input availability changed: '+e.available);
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
		
		/**
		 * Starts monitoring the microphone
		 * @param {Object} args - arguments given to start recording
		 * @param {function} args.callback - function that is called after start is run with recording status of device
		 */
		start: function(args) {
			Titanium.Media.audioSessionCategory = Ti.Media.AUDIO_SESSION_CATEGORY_RECORD;
			
			var data = args || {};
			
			var isRecording = false;
			
			if (!recording.recording && Ti.Media.canRecord) {
				recording.start();
				Ti.Media.startMicrophoneMonitor();
				
				timer = setInterval(incrementDuration, 1000);
				
				console.log("Recording now...");
				
				isRecording = true;
			} else if (recording.recording) {
				console.log("Already started recording.");
				
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

		/**
		 * Stops monitoring the microphone and saves recording to the application data directory
		 * @param {Object} args - arguments given to stop recording
		 * @param {String} args.filename - filename of recording that will be be used when the recording is saved
		 * @param {function} args.callback - function that is called after stop is run with recording status of device
		 */
		stop: function(args) {
			var data = args || {};
			
			if (recording.recording) {
				file = recording.stop();
				Ti.Media.stopMicrophoneMonitor();
				
				clearInterval(timer);
				
				console.log("Stopped recording");
				
				var defaultName = 'Recording_' + (new Date()).toISOString().replace(/[^0-9\-:]/g, "_").slice(0, -5);	// remove miliseconds
				var filename = data.filename || defaultName;
				
				var r = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, filename + ext);
				
				if (r.exists()) {
					var alert = Titanium.UI.createAlertDialog({
					    title: 'File Already Exists',
					    message: 'A recording named “' + filename + '” already exists. Do you want to replace it with the one you’re saving?',
					    buttonNames: ['Replace', 'Keep Both', 'Cancel'],
					    cancel: 2
					});
					
					alert.addEventListener('click', function(f) {
						//Clicked cancel, first check is for iphone, second for android
						if (f.cancel === f.index || f.cancel === true)
							return;
			
						switch (f.index) {
							case 0: 	// Replace
								console.log("Overwrite recording: " + filename + ext);
								r.deleteFile();
								
								r.write(file.toBlob);
								break;
							
							case 1:		// Keep both
								filename += findNextCopy(filename, ext);
								console.log("Saving recording: " + filename + ext);
								
								r = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, filename + ext);
								
								r.write(file.toBlob);
								break;
			 				default:
			 					break;
						}
					});
				 
					alert.show();
				} else {
					console.log("Saving recording: " + filename + ext + " of size: " + file.size);
					r.write(file.toBlob);
				}
				
				if (data.callback !== undefined)
					data.callback({success: true, recording: filename, duration: duration});
				
				return;
			} else {
				console.log("Not recording anything.");
			}
			
			if (data.callback !== undefined)
				data.callback({success: false});
		},

		/**
		 * Pauses or resumes monitoring the microphone
		 * @param {Object} args - arguments given to pause recording
		 * @param {function} args.callback - function that is called after pause is run with recording status of device
		 */
		pause: function(args) {
			var data = args || {};

			if (!recording)
				return 0;
			
			if (recording.paused) {
				console.log("Resuming...");
				recording.resume();
				
				timer = setInterval(incrementDuration, 1000);
			} else {
				console.log("Pausing...");
				recording.pause();
				
				clearInterval(timer);
			}
			
			if (data.callback !== undefined)
				data.callback({pause: recording.getPaused()});
		},

		/**
		 * Returns duration of recording
		 */
		getDuration: function() {
			return duration;
		},
	};

	this.playback = {

		/**
		 * Starts playing back an audio file from the application data directory
		 * @param {Object} args - arguments given to audio playback
		 * @param {String} args.filename - filename of the audio file to be played
		 * @param {function} args.playback - callback function when file has started playing
		 * @param {function} args.complete - callback function when file has finished playing
		 * @param {function} args.error - callback function when file could not be played
		 */
		start: function(args) {
			Titanium.Media.audioSessionCategory = Ti.Media.AUDIO_SESSION_CATEGORY_PLAYBACK;
			
			var data = args || {};
			
			var r = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, data.filename + ext);
			
			if (r.exists()) {
				if (sound && sound.playing) {
					console.log("Playback already started");
				} else {
					console.log("starting playback");
					
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
				var err = 'No file with name "' + data.filename + '" was found.';
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

		/**
		 * Stops playback any sound from device
		 * @param {Object} args - arguments given to stop playback
		 * @param {function} args.callback - callback function when stop is run with playback status of device
		 */
		stop: function(args) {
			var data = args || {};
			
			if (sound && sound.playing) {
				console.log("Stopping playback");
				sound.stop();
				sound.release();
				sound = null;
				
				if (data.callback !== undefined)
					data.callback({playback: false});
			} else {
				console.log("Nothing to stop");
			}
		},

		/**
		 * Pauses or resumes playback of the sound from device
		 * @param {Object} args - arguments given to pause playback
		 * @param {function} args.callback - callback function that is given the playback status
		 */
		pause: function(args) {
			var data = args || {};

			if (!sound)
				return 0;
			
			var isPaused = false;
			
			if (sound.isPaused()) {
				console.log("Resuming...");
				sound.play();
			} else {
				console.log("Pausing...");
				sound.pause();
				
				isPaused = true;
			}
			
			if (data.callback !== undefined)
				data.callback({pause: isPaused});
		},
	};
	
	/**
	 * Renames a file in the application directory. File extension is .wav by default.
	 * @param {Object} args - arguments given to rename a file
	 * @param {String} args.filename - filename of the file to be renamed
	 * @param {String} args.ext - file type of the file to be renamed
	 * @param {String} args.new_filename - new filename
	 * @param {function} args.callback - callback function given the status of the file rename operation
	 */
	this.renameFile = function(args) {
		var data = args || {};
		
		var original = data.filename;
		var new_name = data.new_filename;

		var ext = data.ext || ".wav";
		
		var rename = false;
		
		var r = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, original + ext);
		if (r.exists()) {
			console.log("Renaming");
			
			rename = r.rename(new_name + ext);
			
			if (rename) {
				console.log("Renaming successful");
    		} else {
    			console.log("Renaming failed");
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
	
	/**
	 * Deletes a file in the application directory. File extension is .wav by default.
	 * @param {Object} args - arguments given to delete a file
	 * @param {String} args.filename - filename of the file to be deleted
	 * @param {String} args.ext - file type of the file to be deleted
	 * @param {function} args.callback - callback function given the status of the file delete operation
	 */
	this.deleteFile = function(args) {
		var data = args || {};

		var ext = data.ext || ".wav";
		
		if (data.filename) {
			var r = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, data.filename + ext);
			
			if (r.exists()) {
				console.log("Deleting " + data.filename);
				var result = r.deleteFile();
				
				if (data.callback !== undefined)
					data.callback({success: result});
				
			} else {
				var err = 'No file with name "' + data.filename + '" was found.';
				
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
    
    console.log("dir_files: " + dir_files);
    
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
	    	
	    	console.log("MATCHED: " + fname);
	    	
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

