var cloudantCred = {
  "username": "<<redacted>>",
  "password": "<<redacted>>",
  "host": "4d1cded5-56a3-4ad9-a59a-9c68c192995c-bluemix.cloudant.com",
  "port": 443,
  "url": "https://<<user name redacted>>:<<password redacted>>@4d1cded5-56a3-4ad9-a59a-9c68c192995c-bluemix.cloudant.com"
};


function main(params) {
    var cloudant = require("cloudant")(cloudantCred.url);
    var mydb = cloudant.db.use("smartlocks");
    
    return new Promise(function(success, failure) {
        mydb.get(params.chip, function(err, body) {
            
            // If there is no document, this is a new smartlock to register
            if (err != null && err.statusCode == 404) {
                console.log("New registration " + JSON.stringify(err));
                mydb.insert(
                    {"_id": params.chip, location: "unknown", open: false}, 
                    function() {
                        success({open: false});   // new locks are closed
                    });   // mydb.insert call
                return ;
            }    // end of a new smartlock to register
            
            success({open: body.open});    // Return the read value
        });    // mydb.get call
    });   // new Promise call
}
