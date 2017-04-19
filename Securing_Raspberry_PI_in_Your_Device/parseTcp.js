fs = require("fs")

var dnsRequests = {};
var dns = {};
var clientAccess = {};

fs.readFile("dns", function(err, data) {
	var lines = data.toString().split("\n");

	for(var i=0; i<lines.length; i++) {
		var words = lines[i].split(" ");

		var reqNumber = words[5];

		// Parsing the request number removes the
		// + at the end of requests
		if (reqNumber == parseInt(reqNumber)) {
			if (words[7] == "A")
				for(var j=8; j<words.length; j+=2) {
					// Some IPs end with a comma (whose that 
					// aren't the last in the line) and some
					// don't.
					var ip = words[j].split(",")[0];
					dns[ip] = dnsRequests[reqNumber];
				}
		} else {
			dnsRequests[parseInt(reqNumber)] = words[7];
		}
	}

	// With the DNS information stored, it is time to read
	// and understand the tcpAsClient file
	readTcpFile();
});


// Log the fact that we connected to this port on this hostname
var logAccess = function(name, port) {
	// 
	if (!clientAccess[port])
		clientAccess[port] = {};

	clientAccess[port][name] = true;
};



var readTcpFile = function() {
	fs.readFile("tcpAsClient", function(err, data) {
		var lines = data.toString().split("\n");

		for(var i=0; i<lines.length; i++) {
			var words = lines[i].split(/:? /);
			var nums = words[4].split(".");
			var ip = nums[0]+"."+nums[1]+"."+nums[2]+"."+nums[3];
			var port = nums[4];
			// If there is a DNS entry for the IP address, use
			// it (except for the trailing dot). If there isn't,
			// use the IP itself
			var name = dns[ip] ? dns[ip].slice(0,-1) : ip;	

			logAccess(name, port);
		}

		console.log(JSON.stringify(clientAccess));
	});
};