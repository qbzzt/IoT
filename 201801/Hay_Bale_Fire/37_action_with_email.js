

// Credential for the IBM Cloudant database
const cloudantCred = {
    <<redacted>>
};

const database = "device_objects";

const cloudant = require('@cloudant/cloudant')({
    url: cloudantCred.url
});

const db = cloudant.db.use(database);


// Credential and configuration for the IBM Cloud Object Storage
const cloudObjCred = {
    <<redacted>>
};

const storageEndpoint = "s3-api.us-geo.objectstorage.softlayer.net";
const bucket = "images4detection";


// Credential for IBM Watson Visual Recognition
const visualRecognitionCred = {
    <<redacted>>
};

   

const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');

const visualRecognition = new VisualRecognitionV3({
    version: '2018-03-19',
    iam_apikey: visualRecognitionCred.apikey   
  });



// For sending e-mail
const SendGridAPIKey =     <<redacted>>
const sourceEmail = "notices@example.com";
const destEmail = <<your value here>>
const https = require("https");


const list2HTML = (lst) => {
    if (lst.length == 0)
        return "None";
    
    return `<ul>${lst.map(x => "<li>"+x+"</li>").reduce((a,b) => a+b, " ")}</ul>`;
};


const makeMsg = (newObjs, missingsObjs, pictureURL) => {
    return `
        <H2>Changes</H2>
        <h4>New objects:</h4>
        ${list2HTML(newObjs)}
    
        <h4>Missing objects:</h4>
        ${list2HTML(missingsObjs)}
        
        <h4>Picture</h4>
        <img src="${pictureURL}" height="500" width="800">
    `;
};   // makeMsg



const informUserFunc = (newObjs, missingObjs, devID, pictureURL, success) => {

    const req = https.request({
        method: "POST",
        hostname: "api.sendgrid.com",
        path: "/v3/mail/send",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SendGridAPIKey}`
        }
    },   // end of options for https.request 
    (res) => {
        success({loc: "informUserFunc",
                statusCode: res.statusCode,
                statusMessage: res.statusMessage
        });
    });  // end of https.request
    
    const mailToSend = 
        {"personalizations": [{"to": [{"email": destEmail}]}],
            "from": {"email": sourceEmail},
            "subject": `Changes in device ${devID}`,
            "content": [{
                "type": "text/html", 
                "value": makeMsg(newObjs, missingObjs, pictureURL)
            }]
        };
        
    req.write(JSON.stringify(mailToSend));
    req.end();

}; // end of informUserFunc



const main = params => {
    
    if (params.objName == undefined) {
        return new Promise((success, failure) => {
            const pictureURL = 
                `https://${storageEndpoint}/${bucket}/pict_b8:27:eb:0a:ff:26_2018-07-23T15:34:30.788Z.png`
            
            informUserFunc(["new"], ["missing"], "devID", pictureURL, success);      
        });
    };

    // Parse the object name to get the information encoded in it
    const splitObjName = params.objName.split(".")[0].split("_");
    const devID = splitObjName[1];
    const timestamp = splitObjName[2];
   
    const pictureURL = `https://${storageEndpoint}/${bucket}/${params.objName}`;

    // Classify the objects in the image
	const visRecParams = {
			url: pictureURL
	};

    // Classification takes time, so we need to return a Promise object.		
	return new Promise((success, failure) => {
        visualRecognition.classify(visRecParams, (err, response) => {
            if (err) {
                failure({
                    errLoc: "visualRecognition.classify",
                    err: err
                });
                return;  // Exit the function
            }  
            
            const objects = response.images[0].classifiers[0].classes.map(x => x.class);
            
            db.get(devID, (err, result) => {
                // Not really an error, this is just a new device without an entry yet
                if (err && err.statusCode == 404) {
                    var dataStruct = {};  // Data structure to write to database
                    objects.map(obj => dataStruct[obj] = timestamp);
                    
                    db.insert({_id: devID, data: dataStruct}, (err, result) => {
                        if (err) {
                            failure({
                                errLoc: "db.insert (new entry)",
                                err: err
                            });
                            return;  // Exit the function
                        }
                        
                        // Send message to the user here
                        
                        success({});

                    }); // end of db.insert
                    return;
                }
                
                // If we got here, it's a real error
                if (err) {
                    failure({
                        errLoc: "db.get",
                        err: err
                    });
                    return;  // Exit the function
                }                  

                // Compare the old data with the new one, update as needed and update the database
                // (also, inform the user if needed)
                compareData(objects, result, timestamp, pictureURL, success, failure);
            });   // end of db.get
        });  // end of visualRecognition.classify
	});  // end of new Promise
}; // end of main




// Compare the old data with the new one, update as needed and update the database
// (also, inform the user if needed)
const compareData = (objects, result, timestamp, pictureURL, success, failure) => {
    var data = result.data;  
    var newObjects = [];
    var missingObjects = [];

    objects.map(object => {
        // The object is new, insert it to the new object list
        if (!result.data[object])
            newObjects.push(object);
            
        // Either way, update the time it was last seen
        data[object] = timestamp;
    });
    
    // Look for objects that haven't been seen in 24 hours
    const deadline = new Date(new Date(timestamp) - 24*60*60*1000);
    Object.keys(data).map(object => {
       const lastSeen = new Date(data[object]);
       if (lastSeen < deadline) {
           missingObjects.push(object);
           delete data[object];
       }
    });  // end of Object.keys(data).map
    

        
    // Update the data in the database (that will always be required
    // because if nothing else the timestamps changed)
    const newEntry = {
        _id: result._id,
        _rev: result._rev,
        data: data
    };
    
    const devID = result._id;
    
    db.insert(newEntry, (err, result) => {

        if (err) {
            failure({
                errLoc: "db.insert",
                err: err
                });
            return;  // Exit the function
        }; 
        
        // Do we need to inform a human?
        if (newObjects.length > 0 || missingObjects.length > 0) 
            informUserFunc(newObjects, missingObjects, devID, pictureURL, success)
        else
            success({status: "no change"});
    });  // end of db.insert
}; // end of compareData
