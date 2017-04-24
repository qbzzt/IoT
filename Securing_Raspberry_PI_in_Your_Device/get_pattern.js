var ps = require("ps-man");
var netstat = require("node-netstat");
var child_process = require("child_process");
var fs = require("fs");


// Polling frequency, in seconds. This is how often we look at the
// process and socket lists.
var pollingFreq = 1;

// Time for a full cycle of the device, in seconds. This means that
// anything that happens on this device, we expect to happen at least
// once during that time.
var cycleLength = 60;




// Variables to gather information over a full cycle

// These are filled by polling
var processHistory = {};
var listenSockets = {};

// These are filled by running tcpdump commands and parsing the output
var dns = {};
var tcpClients = {};
var udpClients = {};


// Semaphores to signal that the information is available for reporting
var pollingDone = false;
var parsingDone = false;



// The output of tcpdump as strings
var dnsString = "";
var tcpAsClient = "";
var udpPackets = "";


// Polling functions
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


// End polling
var endPolling = function() {
	clearInterval(processInterval);
	clearInterval(socketInterval);

	pollingDone = true;
};





var startTcpdump = function(filter, time, callback, outOnly) {
	var output = "";
	var process = child_process.spawn("sudo",
		["tcpdump", "--direction=
		 
		 " + (outOnly ? "out" : "inout"), "-n", "-l", filter]);

	process.stdout.on("data", function(data) {
		output += data.toString();
	});

	// Show stderr
	process.stderr.on("data", function(data) {
		console.log("stderr on tcpdump (" + filter + ") :" 
			+ data);
	});

	// Display errors
	process.on("error",function(err) {
		console.log("Error:" + err);
	});

	setTimeout(function() {
		// We can't just use process.kill because it is a 
		// root process and we don't have permissions. So
		// instead we run sudo kill <pid>.
		child_process.spawn("sudo", ["kill", process.pid]);

		callback(output + " ");
	}, time);
};


// If the first callback return true, do the second callback. Otherwise, wait five seconds and try again
var whenDo = function(when, todo) {
	if (when())
		todo();
	else
		setTimeout(function() {whenDo(when, todo);}, 5000);
};


// Parse DNS tcpdump
var parseDNS = function(dnsString) {
	var lines = dnsString.split("\n");
	var dnsRequests = {};	

	for(var i=0; i<lines.length; i++) {
		var words = lines[i].split(" ");

                var reqNumber = words[5];

                // Parsing the request number removes the
                // + at the end of requests
                if (reqNumber == parseInt(reqNumber)) {
			for(var j=8; j<words.length; j+=2) {
				// We only care about A records.      
				//
                	        // Some IPs end with a comma (whose that 
        	                // aren't the last in the line) and some
	                        // don't.
				if (words[j-1] == "A") {
	                        	var ip = words[j].split(",")[0];
	                        	dns[ip] = dnsRequests[reqNumber];
				}
                        }
                } else {
                        dnsRequests[parseInt(reqNumber)] = words[7];
                }
        } 
};



// Parse either TCP or UDP tcpdump
var parsePorts = function(tcpdumpOutput, table) {
	var lines = tcpdumpOutput.split("\n");

	for(var i=0; i<lines.length; i++) {
		var words = lines[i].split(/:? /);

		// Ignore empty lines
		if (words.length < 5) 
			continue;

		var nums = words[4].split(".");
		var ip = nums[0]+"."+nums[1]+"."+nums[2]+"."+nums[3];
		var port = nums[4];
		
		// If there is a DNS entry for the IP address, use
		// it (except for the trailing dot). If there isn't,
		// use the IP itself
		var name = dns[ip] ? dns[ip].slice(0,-1) : ip;	

		if (!table[port])
			table[port] = {};

		table[port][name] = true;
	}
	
};


// Parse the result of the tcpdump commands once all the results are in.
var parseDumps = function() {
	whenDo(function() { 
			return dnsString != "" && 
				tcpAsClient != "" && 
				udpPackets != ""; 
		},
	     	function() {
			parseDNS(dnsString);
			parsePorts(tcpAsClient, tcpClients);
			parsePorts(udpPackets, udpClients);

			parsingDone = true;
		}
	);
};





var saveResults = function() 	{
	whenDo(function() {
		return pollingDone && parsingDone;
	}, function() {
		var result = {
			processes: processHistory,
			listen: listenSockets,
			tcp: tcpClients,
			udp: udpClients
		};
		fs.writeFile("behaviorPattern.json", 
			JSON.stringify(result) + "\n");
	}); 
};


// Processing done when the program starts

// Set up the polling
var processInterval = setInterval(getProcesses, pollingFreq *1000);
var socketInterval = setInterval(getSockets, pollingFreq *1000);

// Start tcpdump's
startTcpdump("tcp[tcpflags] & tcp-syn != 0 and tcp[tcpflags] & tcp-ack == 0 and tcp", 
	cycleLength*1000, function(output) { tcpAsClient = output; }, true);


startTcpdump("port 53",
	cycleLength*1000, function(output) { dnsString = output; }, false);


startTcpdump("udp",
	cycleLength*1000, function(output) { udpPackets = output; }, true);



// Processing done after a cycle has passed
setTimeout(endPolling, cycleLength*1000);
setTimeout(parseDumps, cycleLength*1000);
setTimeout(saveResults, cycleLength*1000);
