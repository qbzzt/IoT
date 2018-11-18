var lay = "none";'

// Check connectivity
const checkConn = () => {
  if (lay !== "none") app.RemoveLayout(lay);

	lay = app.CreateLayout("linear", "VCenter,FillXY");	 
	const ssid = app.GetSSID();
	const ip = app.GetIPAddress();
	lay.AddChild(app.CreateText(`SSID: ${ssid}`));
	lay.AddChild(app.CreateText(`IP: ${ip}`));	
  app.AddLayout(lay);
};  // checkConn



// Called when application is started.
const OnStart = () => {
    setInterval(checkConn, 6000);
    app.WifiConnect("barn-net", "");
    app.SetOnWifiChange(checkConn);
    checkConn();
};   // OnStart



