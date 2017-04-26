// Create the firewall rules to enforce a pattern detected by 
// get_pattern.js and stored in behaviorPattern.json.

var fs = require("fs");



var behaviorPattern;


// The Firewall rules, as a 
var fwRules = 
	"#! /bin/bash\n" + 
	"#\n" + 
	"iptables -F INPUT\n" + 
	"iptables -F OUTPUT\n\n" + 
	"iptables -P INPUT ACCEPT\n" +
	"iptables -P OUTPUT ACCEPT\n" + 
	"iptables -A INPUT -i lo -j ACCEPT\n" +
	"iptables -A OUTPUT -o lo -j ACCEPT\n" +
	"iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT\n" +
	"iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT\n\n"; 



fs.readFile("behaviorPattern.json", function(err, data) {
	behaviorPattern = JSON.parse(data);

	processListenPorts(behaviorPattern.listen);
	processTCP(behaviorPattern.tcp);

	fs.writeFile("fwCommands.sh", fwRules);
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

	fwRules += "iptables -A INPUT -p tcp -j REJECT\n";
	fwRules += "iptables -A INPUT -j ACCEPT\n\n";
};


var processTCP = function(tcp) {
	// The port numbers
	var ports = Object.keys(tcp);

	for(var i=0; i<ports.length; i++) {
		var hosts = Object.keys(tcp[ports[i]]);
		for(var j=0; j<hosts.length; j++)
			fwRules += 
			"iptables -A OUTPUT -p tcp -m state " + 
				"--state NEW -m tcp --dport " +
				ports[i] + " -d " + hosts[j] +
				" -j ACCEPT\n"

	}

	fwRules += "iptables -A OUTPUT -p tcp -j DROP\n";
	fwRules += "iptables -A OUTPUT -j ACCEPT\n\n";

};
