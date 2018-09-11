 const NodeWebcam = require( "node-webcam" );
 
 
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
Webcam.capture("/tmp/pict1", (err, data) => {
	if (err) 
		console.log("Webcam.capture error " + err);
}); // end of Webcam.capture
