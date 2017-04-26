// Create the firewall rules to enforce a pattern detected by 
// get_pattern.js and stored in behaviorPattern.json.

// var ps = require("ps-man");
var fs = require("fs");
// var child_process = require("child_process");


var behaviorPattern;


// The Firewall rules, as a 
var fwRules = 
	"#! /bin/bash\n" + 
	"#\n" + 
	"iptables -F INPUT\n" + 
	"iptables -F OUTPUT\n\n" + 
	"iptables -P INPUT DROP\n" +
	"iptables -P OUTPUT ACCEPT\n" + 
	"iptables -A INPUT -i lo -j ACCEPT\n" +
	"iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT\n"; 




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

	// For now, only deal with TCP ports
	var tcpPorts = portByProto.tcp;
	for(var j=0; j<tcpPorts.length; j++)
		fwRules += 
			"iptables -A INPUT -p tcp -m state " + 
				"--state NEW -m tcp --dport " +
				tcpPorts[j]  +" -j ACCEPT\n"

	fwRules += "iptables -A INPUT -j DROP\n\n";

	console.log(fwRules);
};