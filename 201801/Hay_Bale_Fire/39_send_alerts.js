// Identifier for this device
const devID = -1;



// Divide time into ten minute slices
const timeDiff = 10*60*1000;

// Threshold at which there's an alarm
const threshold = 0.75;

// Directory to store pictures
const pictDir = "/tmp";


const PiCamera = require('pi-camera');

// Takes about 20 minutes to install
const imgSSIM = require("img-ssim");

// File manipulation
const fs = require("fs");
 
// HTTP client code
const http = require('http');
 


// Get a timestamp for the current slice of time
const getTimeStamp = () => {
	const now = Date.now();   // msec from start of epoch
	const dateObj = new Date();
	dateObj.setTime(Math.floor(now / timeDiff) * timeDiff);
	
	// A colon confuses the image comparison library
	return `${dateObj.getHours()}_${dateObj.getMinutes()}`;
};


// Get the filename for a picture taken at this time
const getFname = () => `${pictDir}/pict_${getTimeStamp()}.png`;


// The filename of the new picture, the one in processing
const newPictFname = `${pictDir}/new_pict.png`;



// Processing: 
// 1. Take a picture
// 2. Check if there is already a picture for this time stamp. 
// 3. If there is, compare the two pictures
// 4. If different, raise the alarm and preserve the old picture.
// 5. Put the new picture in the directory
const processPicture = () => {
	const currentPict = getFname();
	
	// Take new picture


	const myCamera = new PiCamera({
		mode: 'photo',
		output: newPictFname,
		nopreview: true
	});

	myCamera.snap().then(result => {
		if (err) {
			console.log(`Webcam.capture error: ${err}`);
			return ;  // Exit the function call
		}
		
		if (fs.existsSync(currentPict)) {
			imgSSIM(currentPict, newPictFname, {
				enforceSameSize: false,
				resize: true
			}, (err, score) => {
				if (err) {
					console.log(`imgSSIM error: ${err}`);
					return ;
				};
				
				// If the score is too low, raise the alarm.
				if (score < threshold) {
					http.get(`http://10.0.0.1/${devID}/99/99`);
					console.log(`alert about ${currentPict} ${threshold}`);
				};
				
				// Replace the picture with the new one.
				fs.rename(newPictFname, currentPict, (err) => {
					console.log(`Rename to ${currentPict}. Err: ${err}`);
				});  // fs.rename
			
			});  // imgSSIM
		} else {  // if (fs.existsSync())
			fs.rename(newPictFname, currentPict, (err) => {
				console.log(`NO ${currentPict} yet, rename. Err: ${err}`);
			});  // fs.rename
		} // if (fs.existsSync())
		
	});  // myCamera.snap().then
};  // processPicture definition


// Use crontab to run repeatedly
processPicture();
