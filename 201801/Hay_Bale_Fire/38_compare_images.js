const PiCamera = require('pi-camera');

const myCamera = new PiCamera({
	mode: 'photo',
	output: '/tmp/test2.png',
	nopreview: true
});

// Takes about 20 minutes to install
const imgSSIM = require("img-ssim");
 

myCamera.snap()
	.then(result => {
		imgSSIM(
		"/tmp/test.png",
		"/tmp/test2.png",
    		(err, similarity) => {
			console.log(err || similarity);
		});  // end of imgSSIM			
	})  // end of myCamera.snap()
	.catch(err => console.log('Error ' + err));



