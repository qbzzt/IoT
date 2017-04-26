// Create the firewall rules to enforce a pattern detected by 
// get_pattern.js and stored in behaviorPattern.json.

// var ps = require("ps-man");
var fs = require("fs");
// var child_process = require("child_process");


var behaviorPattern;


fs.readFile("behaviorPattern.json", function(err, data) {
	behaviorPattern = JSON.parse(data);

	processListenPorts(behaviorPattern.listen);
});



var processListenPorts = function(listenPorts) {
	// Only get the part we care about
	var ports = Object.keys(listenPorts);

	// Split the ports by protocol
	var portByProto = {};

	for(var i=0; i<ports.length; i++) {
		var temp = ports[i].split("/");
		var proto = temp[1];
		var portNum = temp[0];

		if (portByProto[proto] == undefined)
			portByProto[proto] = [portNum];
		else
			portByProto[proto][portByProto[proto].length] = portNum;
	}

	console.log(portByProto);
};