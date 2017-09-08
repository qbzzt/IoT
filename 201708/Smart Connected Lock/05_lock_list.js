var cloudantCred = {
<<redacted>>
};


var cloudant = require("cloudant")(cloudantCred.url);
var mydb = cloudant.db.use("smartlocks");




var returnHtml = function(callback) {
    mydb.list({include_docs:true}, function(err, res) {
        var data = res.rows.map((entry) => {
            return {
                id: entry.id,
                location: entry.doc.location,
                open: entry.doc.open
            };    
        });
        
        var unknownLoc = data.filter((entry) => {return entry.location == "unknown";});
        var knownLoc = data.filter((entry) => {return entry.location != "unknown";});
            
        var unknownLocRows = unknownLoc.map((entry) => {
           return `<tr>
                        <td>
                            ${entry.id}
                        </td>
                        <td>
                            <input type="text" ng-model="unknownLoc[${entry.id}]"></input>
                            <a ng-href="{{setLocationURL(${entry.id})}}">
                                <button class="btn btn-default" type="button">&#x2714;</button>
                            </a>
                        </td>
                    </tr>`;
        });
            
        var knownLocRows = knownLoc.map((entry) => {
           return `<tr>
                        <td>
                            ${entry.id}
                        </td>
                        <td>
                            ${entry.location}
                        </td>
                        <td>
                            ${entry.open ? "Open" : "Locked"}
                            <button class="btn ${entry.open ? "btn-danger" : "btn-success"}" type="button"
                                onClick="window.location.href='ui?id=${entry.id}&action=${
                                    entry.open ? "close" : "open"}Lock'"
                            >
                                ${entry.open ? "Lock" : "Unlock"}
                            </button>
                        </td>
                    </tr>`;
        });            
        
        var unknownLocTable = "";
        if (unknownLocRows.length > 0)  
            unknownLocTable = unknownLocRows.reduce((a,b) => {return a+b;});

        var knownLocTable = "";
        if (knownLocRows.length > 0)  
            knownLocTable = knownLocRows.reduce((a,b) => {return a+b;});
            
            
        html = `
<!DOCTYPE html>
<html ng-app="myApp" ng-controller="myCtrl">

  <head>
    <title>Smart-Lock User Interface</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap-theme.min.css">
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>
    
    <!--  Use the Angular library  -->
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-cookies.js"></script>

    
	<script>
	var myApp = angular.module("myApp", []);
	var scope;
		

	myApp.controller("myCtrl", function($scope) {
		// Make the scope available outside the controller, which is very useful for
		// debugging
  		scope = $scope;
  		
  		$scope.unknownLoc = {};
  		
  		$scope.setLocationURL = function(id) {
            return 'ui?id=' + id + '&action=setLocation&location=' + 
                encodeURIComponent($scope.unknownLoc[id]);
  		};
	});
	
	</script>
    
    </head>
    <body>
        <div class="panel panel-info">
            <div class="panel-heading">
                Specify Location
            </div>
            <div class="panel-body">
                <table class="table">
                    <tr>
                        <th>Lock Chip ID</th>
                        <th>Location</th>
                    </tr>
                    ${unknownLocTable}
                </table>
            </div>
        </div>
        
        <div class="panel panel-primary">
            <div class="panel-heading">
                Change lock status
            </div>
            <div class="panel-body">
                <table class="table">
                    <tr>
                        <th>Lock Chip ID</th>
                        <th>Location</th>
                        <th>Curret status</th>
                    </tr>
                    ${knownLocTable}
                </table>
            </div>
        </div>
    </body>
</html>
           
`;
            
        callback({html: html}); 
    }); // end of mydb.list call    
};   // end of returnHtml definition



var modifyEntry = function(id, newVals, success) {
    mydb.get(id, function(err, res) {
        // If newVals has a key, replace the result with it.
        Object.keys(newVals).forEach(function(key) {res[key]=newVals[key];});
        res.lastChange = Date.now();
        
        mydb.insert(res, function(err, body) {
            returnHtml(success);            
        });    // mydb.insert callback
    });   // mydb.get callback
};   // end of modifyEntry



function main(params) {
     if(params.action == "setLocation") 
         return new Promise(function(success, failure) {
             modifyEntry(params.id, {location: params.location}, success);
         });

     if (params.action == "openLock")
         return new Promise(function(success, failure) {
             modifyEntry(params.id, {open: true}, success);
         });
     
     if (params.action == "closeLock") 
         return new Promise(function(success, failure) {
             modifyEntry(params.id, {open: false}, success);
         });

    // If we get here, there is no action to do, just return the HTML
    return new Promise(function(success, failure) {
        returnHtml(success);
        });   // new Promise object
}   // main
