
// Credential for the IBM Cloudant database
const cloudantCred = {
  <<redacted>>
}

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


// Credential for IBM Watson Visual Recognition
const visualRecognitionCred = {
  <<redacted>>
};



const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');

const visualRecognition = new VisualRecognitionV3({
    version: '2018-03-19',
    iam_apikey: visualRecognitionCred.apikey   
  });

const bucket = "images4detection";




const main = params => {
    // Parse the object name to get the information encoded in it
    const splitObjName = params.objName.split(".")[0].split("_");
    const devID = splitObjName[1];
    const timestamp = splitObjName[2];
    

    // Classify the objects in the image
	const visRecParams = {
			url: `https://${storageEndpoint}/${bucket}/${params.objName}`
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
                compareData(objects, result, timestamp, success, failure);
            });   // end of db.get
        });  // end of visualRecognition.classify
	});  // end of new Promise
}; // end of main



// Compare the old data with the new one, update as needed and update the database
// (also, inform the user if needed)
const compareData = (objects, result, timestamp, success, failure) => {
    var data = result.data;  
    var newObjects = [];
    var missingObjects = [];
    var informHuman = false;
    
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
    
    // Do we need to inform a human?
    if (newObjects.length > 0 || missingObjects.length > 0) 
        informHuman = true;
        
    // Update the data in the database (that will always be required
    // because if nothing else the timestamps changed)
    const newEntry = {
        _id: result._id,
        _rev: result._rev,
        data: data
    };
    
    db.insert(newEntry, (err, result) => {

        if (err) {
            failure({
                errLoc: "db.insert",
                err: err
                });
            return;  // Exit the function
        }; 
        
        success({
            new: newObjects,
            missing: missingObjects,
            data: data
        });
    });  // end of db.insert
}; // end of compareData
