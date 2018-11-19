var lay = "none";

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



// Check connectivity
const checkConn = () => {
	clearScreen();
	showString(`SSID: ${app.GetSSID()}`);
	showString(`IP: ${app.GetIPAddress()}`);
};  // checkConn



// Called when application is started.
const OnStart = () => {
    setInterval(checkConn, 6000);
    app.WifiConnect("barn-net", "");
    app.SetOnWifiChange(checkConn);
    checkConn();
};   // OnStart



