var cloudantCred = {
<<redacted>>
};


var cloudant = require("cloudant")(cloudantCred.url);
var mydb = cloudant.db.use("smartlocks");



var leftToLock;


var lock = function(id, success) {
    mydb.get(id, function(err, res) {
        res.open = false;
        res.lastChange = Date.now();
        
        mydb.insert(res, function(err, body) {
            leftToLock --;
            
            if (leftToLock == 0) {   // We're done
                success({});
            } // leftToLock == 0
        });    // mydb.insert
    });   // mydb.get
};   // end of lock



function main(params) {
    return new Promise(function(success, failure) {
        mydb.list({include_docs:true}, function(err, res) {
            var data = res.rows.map((entry) => {
                return {
                    id: entry.id,
                    lastChange: entry.doc.lastChange,
                    open: entry.doc.open
                };    
            });    // res.rows.map for data
            
            // We only care about entries that haven't been changed in the last five minutes
            var now = Date.now();
            data = data.filter((entry) => {return now-entry.lastChange > 5*60*1000;});
            
            // We only care about those entries that have an open lock
            data = data.filter((entry) => {return entry.open});
            
            // Lock the entries in data.
            leftToLock = data.length;
            data.map((entry) => {lock(entry.id, success)});
        });  // mydb.list
    });    // new Promise
}    // main
