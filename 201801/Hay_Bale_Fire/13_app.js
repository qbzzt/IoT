var noble = require("noble");
var express = require('express');

var app = express();


// The recent readings, an array of structures, each with temp, humidity, and timestamp.
var recentReadings = [];




// Bluetooth
var devTypeID = "ebdd49acb2e740eb55f5d0ab";

var plugService = "a22bd383" + devTypeID;
var plugChars = {
	"top": "a22b0090" + devTypeID,
	"bottom": "a22b0095" + devTypeID
};

var plugServices = [plugService];
var plugCharacteristics = Object.keys(plugChars).map(k => plugChars[k]);
var plugAPI = {};




var readPlug = (plug, cb) => {
	plug.read((err, data) => {
		cb(data[0] !== 0);
	});
};



var writePlug = (plug, val, cb) => {
	plug.write(Buffer.from([val ? 1 : 0]), true, (err) => {
		cb();
	});
};


var togglePlug = (plug) => {
	readPlug(plug, currentVal => writePlug(plug, !currentVal, () => {}));
};


var plugDiscovered = plugDevice => {
	noble.stopScanning();

	plugDevice.once("connect", () => {
		console.log("Connected to the plug through Bluetooth");

		plugDevice.discoverSomeServicesAndCharacteristics(plugServices, plugCharacteristics,
			(err, services, charObjs) => {
				Object.keys(plugChars).map((plugName) => {
					plugAPI[plugName] = charObjs.filter(c => c.uuid === plugChars[plugName])[0];
				});

				console.log("APIs: " + Object.keys(plugAPI));

        // Update every minute even if there are no new readings
        setInterval(update, 60*1000);
		});  // plugDevice.discoverSoServicesAndCharacteristics

	});    // plugDevice.once("connect")

	plugDevice.connect();
};


// recentReadings manipulation

// Get the maximum between two numbers
var max = (a, b) => a > b ? a : b;

// Get the maximum temperature and humidity
var getMax = (arr) => {
  return arr.reduce((a,b) => {
	   return {temp: max(a.temp, b.temp), humidity: max(a.humidity, b.humidity)};
   }, {temp:0, humidity: 0}); // End of arr.reduce
};    // End of getMax declaration


// Remove old (>10 minutes) readings
var removeOld = () => {
	recentReadings = recentReadings.filter(a => a.time > Date.now()-10*60*1000);
};



// The actual analysis

var update = () => {
  var fanPlug = plugAPI.top;
  var heaterPlug = plugAPI.bottom;

  removeOld();

  // No point in updates until we have the plugs
  if (fanPlug === undefined || heaterPlug === undefined)
    return;

  var maxValues = getMax(recentReadings);

  // Desired states, off by default
  var fanPlugState = false;
  var heaterPlugState = false;

  // Try to reduce the temperatue using the fan
  if (maxValues.temp < 80 && maxValues.temp > 50)
    fanPlugState = true;

  // Try to dry the hay using the heater
  if (maxValues.temp < 50 && maxValues.humidity > 20)
    heaterPlugState = true;

  // Show what is happening
  console.log(`Update. Maximums: ${JSON.stringify(maxValues)}, fan: ${fanPlugState}, heater: ${heaterPlugState}`);

  // Write the states
  writePlug(fanPlug, fanPlugState, () => {});
  writePlug(heaterPlug, heaterPlugState, () => {});
};

// Debugging information

app.get("/readings", (req, res) => {
  res.send(recentReadings);
});


app.get("/max", (req, res) => {
  res.send(getMax(recentReadings));
});


app.get("/plugs", (req, res) => {
    readPlug(plugAPI.top, topState => {
      readPlug(plugAPI.bottom, bottomState => {
        res.send(`top plug: ${topState}, bottom plug: ${bottomState}`);
      });   // readPlug bottom
    })      // readPlug top
});         // app.get("/plugs"



// Process readings


app.get("/:cpu/:temp/:humidity", (req, res) => {
  res.send("Hello, world");  // Just to respond with something
  recentReadings.push({
    temp: parseInt(req.params.temp),
    humidity: parseInt(req.params.humidity),
    time: Date.now()
  });
  console.log(`${req.params.cpu} reports ${req.params.temp} C and ${req.params.humidity}%`);
  update();
});




noble.startScanning(plugServices);
noble.on("stateChange", state => console.log("Bluetooth state is now " + state));
noble.on("discover", plugDiscovered);


// Start the web server. Listen to all IP addresses
app.listen(80, '0.0.0.0', () => {console.log("Web server started")});
