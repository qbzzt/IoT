// Credential and configuration for the IBM Cloud Object Storage
const serviceAcctCred = {
  "apikey": "J6N4QW5g5o0rMV35ovRPjJ3A0epTEjNFqe86dwFDkYH0",
  "endpoints": "https://cos-service.bluemix.net/endpoints",
  "iam_apikey_description": "Auto generated apikey during resource-key operation for Instance - crn:v1:bluemix:public:cloud-object-storage:global:a/5aa16d43d02e6aec9a3ee46954d11fbb:292726d9-dd55-4d6e-917b-fecc6fa111a4::",
  "iam_apikey_name": "auto-generated-apikey-2fc314fa-5d9d-4b3e-83fa-64a04fa31e56",
  "iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Writer",
  "iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::a/5aa16d43d02e6aec9a3ee46954d11fbb::serviceid:ServiceId-da33fb0b-9b63-4f29-99bc-a31abf24de4d",
  "resource_instance_id": "crn:v1:bluemix:public:cloud-object-storage:global:a/5aa16d43d02e6aec9a3ee46954d11fbb:292726d9-dd55-4d6e-917b-fecc6fa111a4::"	
};

const storageEndpoint = "s3-api.us-geo.objectstorage.softlayer.net";


// Credential for IBM Watson Visual Recognition
const visualRecognitionCred = {
  "apikey": "bHCJHza56VZDTkqlCvEB590PV4WzthZ1cwyUFcXYdVHp",
  "iam_apikey_description": "Auto generated apikey during resource-key operation for Instance - crn:v1:bluemix:public:watson-vision-combined:us-south:a/5aa16d43d02e6aec9a3ee46954d11fbb:587f4533-e56b-497e-bb3f-c4dad8f6a588::",
  "iam_apikey_name": "auto-generated-apikey-103085ab-f8ef-49d8-9ab8-6ada91b90e69",
  "iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Manager",
  "iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::a/5aa16d43d02e6aec9a3ee46954d11fbb::serviceid:ServiceId-da33fb0b-9b63-4f29-99bc-a31abf24de4d",
  "url": "https://gateway.watsonplatform.net/visual-recognition/api"
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
	
	

 
