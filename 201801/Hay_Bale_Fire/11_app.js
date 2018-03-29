var noble = require("noble");

var devTypeID = "ebdd49acb2e740eb55f5d0ab";

var plugService = "a22bd383" + devTypeID;
var topPlug = "a22b0090" + devTypeID;
var bottomPlug = "a22b0095" + devTypeID;

var plugServices = [plugService];
var plugCharacteristics = [topPlug, bottomPlug];
var plugAPI = [null, null];

const TOP = 0;
const BOTTOM = 1;



var readPlug = (plug, cb) => {
	plugAPI[plug].read((err, data) => {
		cb(data[0] !== 0);
	});
};



var writePlug = (plug, val, cb) => {
	plugAPI[plug].write(Buffer.from([val ? 1 : 0]), true, (err) => {
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
		console.log("Connected");

		plug.discoverSomeServicesAndCharacteristics(plugServices, plugCharacteristics,
			(err, services, characteristics) => {
				plugAPI[TOP] = characteristics.filter(c => c.uuid === topPlug)[0];
				plugAPI[BOTTOM] = characteristics.filter(c => c.uuid === bottomPlug)[0];

				setInterval(() => togglePlug(TOP), 500);
		});  // plug.discoverSoServicesAndCharacteristics

	});    // plug.once("connect")

	plug.connect();
};



noble.on("discover", plugDiscovered);
