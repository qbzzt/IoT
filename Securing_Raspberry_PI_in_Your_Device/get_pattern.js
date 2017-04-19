var ps = require("ps-man");
var netstat = require("node-netstat");
var child_process = require("child_process");



// Polling frequency, in seconds. This is how often we look at the
// process and socket lists.
var pollingFreq = 1;

// Time for a full cycle of the device, in seconds. This means that
// anything that happens to this device, we expect to happen at least
// once during that time.
var cycleLength = 60;




// Variables to gather process and socket information over a full cycle
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


// Set up the polling
var processInterval = setInterval(getProcesses, pollingFreq *1000);
var socketInterval = setInterval(getSockets, pollingFreq *1000);


// End polling
var endPolling = function() {
	clearInterval(processInterval);
	clearInterval(socketInterval);
};

// Set up end of polling
setTimeout(function() {
		endPolling();
		console.log(JSON.stringify({
			processes: processHistory,
			sockets: listenSockets		
		}));
	}, cycleLength*1000);



var startTcpdump = function(filter, time, callback) {
	var output = "";
	var process = child_process.spawn("sudo",
		["tcpdump", "--direction=out", "-n", "-l", filter]);
	process.stdout.on("data", function(data) {
		output += data;
	});

	// Show stderr
	process.stderr.on("data", function(data) {
		console.log("stderr on tcpdump:" + data);
	});

	// Ignore the error that results from killing the tcpdump
	process.on("error",function(err) {
		console.log("Error:" + err);
	});

	setTimeout(function() {
		callback(output);

		// We can't just use process.kill because it is a 
		// root process and we don't have permissions. So
		// instead we run sudo kill <pid>.
		child_process.spawn("sudo", 
			["kill", process.pid]);
	}, time*1000);
};

startTcpdump("port 80", 10, function(output) {console.log(output)});


