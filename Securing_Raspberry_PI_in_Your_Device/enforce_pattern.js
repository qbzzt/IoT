// Enforce a pattern detected by get_pattern.js and stored in
// behaviorPattern.json.

var ps = require("ps-man");
var fs = require("fs");
var child_process = require("child_process");


var behaviorPattern;


fs.readFile("behaviorPattern.json", function(err, data) {
	behaviorPattern = JSON.parse(data);

	// Repeatedly kill any process that should not be running.
	// Do this often (every 100 milliseconds) to ensure such
	// processes don't have much time for mischief
	setInterval(function() {
		enforceProcesses(behaviorPattern.processes);
	}, 100);
});


// There are some processes we don't want to kill even though they
// may have not been part of the original pattern
var allowable = function(result) {
	// Don't commit suicide
	if (result.pid == process.pid)
		return true;

	// Don't kill the killers
	if (result.command.match(/sudo kill -9/))
		return true;

	// Don't kill kernel worker threads
	if (result.command.match(/\[kworker.*\]/))
		return true; 

	// If we get here, there is no reason to preserve the process
	return false;
};


// Kill any process whose command has not been seen when getting the
// behavior pattern
var enforceProcesses = function(processes) {
	ps.list({}, function(err, result) {
		for(var i=0; i<result.length; i++) {
			if (!processes[result[i].command] &&
				!allowable(result[i]) ) {
				child_process.spawn("sudo",
					["kill", "-9", result[i].pid]);
				console.log("Killed " + result[i].command);
			}
		}
	});

}