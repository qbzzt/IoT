var noble = require("noble");

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

noble.startScanning(plugServices);

noble.on("stateChange", state => console.log("Bluetooth state is now " + state));

var plugDiscovered = plug => {
	noble.stopScanning();

	plug.once("connect", () => {
		console.log("Connected to the plug through Bluetooth");

		plug.discoverSomeServicesAndCharacteristics(plugServices, plugCharacteristics,
			(err, services, characteristics) => {
				plugAPI["top"] = characteristics.filter(c => c.uuid === plugChars["top"])[0];

				setInterval(() => togglePlug(plugAPI("top"), 500);
		});  // plug.discoverSoServicesAndCharacteristics

	});    // plug.once("connect")

	plug.connect();
};



noble.on("discover", plugDiscovered);
