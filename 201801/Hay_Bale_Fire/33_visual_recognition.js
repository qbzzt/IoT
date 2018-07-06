// Credential and configuration for the IBM Cloud Object Storage
const serviceAcctCred = {
    <<redacted>>
};

const storageEndpoint = "s3-api.us-geo.objectstorage.softlayer.net";


// Credential for IBM Watson Visual Recognition
const visualRecognitionCred = {
    <<redacted>>	
};




const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');

const visualRecognition = new VisualRecognitionV3({
    version: '2018-03-19',
    iam_apikey: visualRecognitionCred.apikey   
  });



const fname = "/tmp/test.png";
const bucket = "images4detection";
const objName = "picture.png";


const PiCamera = require('pi-camera');

const myCamera = new PiCamera({
	mode: 'photo',
	output: fname,
	nopreview: true
});





const ObjectStorageLib = require("ibm-cos-sdk");
const objectStorage = new ObjectStorageLib.S3({
	endpoint: storageEndpoint,
	apiKeyId: serviceAcctCred.apikey,
	ibmAuthEndpoint: 'https://iam.ng.bluemix.net/oidc/token',
    serviceInstanceId: serviceAcctCred.resource_instance_id
});


const fs = require("fs");


// The image file size is less than 5 MB, so there's no need for a 
// multi-part upload
const uploadImage = (key, callback) => {

    fs.readFile(fname, (err, data) => { 
		if (err) {
			console.log(`Error reading file ${fname}: ${err}`);
			process.exit();
		}
		  	
		objectStorage.putObject({
			Bucket: bucket,
			Key: key,
			ACL: "public-read",
			Body: data
		}).promise()
		.then(callback)
		.catch(e => console.log("Image upload error: " + e))
	});
};





myCamera.snap()
	.then(uploadImage(objName, () => {
		console.log("Done uploading");
		const params = {
			url: `https://${storageEndpoint}/${bucket}/${objName}`
		};
		
		console.log(`Picture located at ${params.url}`);

		visualRecognition.classify(params, (err, response) => {
			if (err)
				console.log(err);
			else
				console.log(JSON.stringify(response, null, 2));
				
			process.exit();
		});
	}))
	.catch(err => console.log('myCamera.snap error ' + err));
	
	

 
