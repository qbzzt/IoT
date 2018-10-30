const NodeWebcam = require( "node-webcam" );

// Takes about 20 minutes to install
const imgSSIM = require("img-ssim");
 

 
// Create webcam instance 
const Webcam = NodeWebcam.create({
	// The output can be png or jpeg
    output: "png",
 
	// Use the default device
    device: false,
 
	// The picture can be provided as a buffer or a
	// base64 string - but in this case we want to
	// store it in a file 
    callbackReturn: "location"
 
});  // NodeWebcam.create
 
 
// The type is appended automatically
Webcam.capture("/tmp/pict2", (err, data) => {
	if (err) {
		console.log("Webcam.capture error " + err);
		return;
	}
	
	imgSSIM(
		"/tmp/pict1.png",
		"/tmp/pict2.png",
    	(err, similarity) => {
			console.log(err || similarity);
	});  // end of imgSSIM
		
}); // end of Webcam.capture
