var lay = "none";

var readingsNum = 0;

// Clear the screen
const clearScreen = () => {
	if (lay !== "none")
		app.RemoveLayout(lay);
	
	lay = app.CreateLayout("linear", "VCenter,FillXY");
	app.AddLayout(lay);
}; // clearScreen



// Add a string to the screen
const showString = str => {
	lay.AddChild(app.CreateText(str));
}; // showString


// Read data from the the Raspberry Pi
const readData = () => {
    app.HttpRequest("GET", "http://10.0.0.1/data", null, null, 
        (err, reply) => {
            if (err) {
                alert("Error getting data from Raspberry Pi");
                showString(reply);
            }  // if (err)
            
            newReadings = JSON.parse(reply);
            readingsNum += newReadings.length;
        });  // app.HttpRequest
};  // readData


// Check connectivity
const checkConn = () => {
	clearScreen();
	showString(`SSID: ${app.GetSSID()}`);
	showString(`IP: ${app.GetIPAddress()}`);
	showString(`Readings so far: ${readingsNum}`);
	readData();
};  // checkConn



// Called when application is started.
const OnStart = () => {
    setInterval(checkConn, 6000);
    app.SetOnWifiChange(checkConn);
    checkConn();
};   // OnStart
