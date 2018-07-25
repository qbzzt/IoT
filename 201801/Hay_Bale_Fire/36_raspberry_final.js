// API for our server code
const APIUrl = "<<replace with your own value>>";
const funcPath = "/image";

// How often (in minutes) to take a picture and upload it
const freq = 10;

// Credential and configuration for the IBM Cloud Object Storage
const serviceAcctCred = {
  <<redacted>>
};

const storageEndpoint = "s3-api.us-geo.objectstorage.softlayer.net";



const fname = "/tmp/test.png";
const bucket = "images4detection";



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
const os = require("os");
const https = require('https');

// In case there are multiple devices using this system, use a 
// device identifier. We use the MAC address, which should be unique
const devID = os.networkInterfaces()["wlan0"][0].mac;


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



const timestamp = () => {
	return new Date(Date.now()).toISOString();
};

const objName = () => {
	return `pict_${devID}_${timestamp()}.png`;
};


const processPicture = () => {
	console.log("processPicture " + timestamp());
	myCamera.snap().then(
		() => {
			const currentObjName = objName();
			
			console.log("Need to upload " + currentObjName);
			
			uploadImage(currentObjName, () => {
				console.log("uploaded " + currentObjName);
				https.get(`${APIUrl}${funcPath}?objName=${currentObjName}`, 
					(res) => {
					console.log(`Done with ${currentObjName}`);
					console.log("------------------------------");
				}); // end of https.get
			});  // end of uploadImage
	});     // end of .snap.then()
};  // end of processPicture



processPicture();

// Process a picture every freq minutes
setInterval(processPicture, 1000*60*freq);
