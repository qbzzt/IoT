const PiCamera = require('pi-camera');

const myCamera = new PiCamera({
	mode: 'photo',
	output: '/tmp/test.png',
	nopreview: true
});

myCamera.snap()
	.then(result => console.log('Success ' + result))
	.catch(err => console.log('Error ' + err));
