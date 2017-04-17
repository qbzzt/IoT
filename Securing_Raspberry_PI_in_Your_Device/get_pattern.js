var ps = require("ps-man");
var netstat = require("node-netstat");

var processHistory = {};
var listenSockets = {};


var getProcesses = function() {
	ps.list({}, function(err, result) {
		for(var i=0; i<result.length; i++)
			processHistory[result[i].command] = true;
	});
};


var getSockets = function() {
	netstat(
		{
			filter: {state: "LISTEN"}
		}, function(data) {
			listenSockets[data["local"]["port"] + "/" + data["protocol"]] = true			
		});
};


getSockets();

// setInterval(getProcesses, 1000);

setInterval(function(){
		console.log("------------------");
		console.log(JSON.stringify(processHistory));
		console.log("------------------");
		console.log(JSON.stringify(listenSockets));

	}, 60*1000);



