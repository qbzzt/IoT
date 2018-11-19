var lay = "none";

var readings = [];

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
                showString(`Err: ${err}`);
                showString(`${reply}`);
                
                return ;
            }  // if (err)
            
            try {
                readings = JSON.parse(reply);
                readings = readings.concat(JSON.parse(reply));
            } catch (err) {
                showString(`Parse error ${err}`);
            }
        });  // app.HttpRequest
};  // readData


// Main loop
const mainLoop = () => {
	clearScreen();
	showString(`SSID: ${app.GetSSID()}`);
	showString(`IP: ${app.GetIPAddress()}`);
	if (app.GetSSID() === '"barn_net"')
		readData();
	showString(`Readings so far: ${JSON.stringify(readings)}`);
};  // mainLoop


// Called when application is started.
const OnStart = () => {
    setInterval(mainLoop, 6000);
    mainLoop();
};   // OnStart
