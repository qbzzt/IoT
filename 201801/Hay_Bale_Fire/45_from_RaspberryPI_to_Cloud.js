const params = {
    orgID: "86nt5n",
    devType: "Hay-Sensor",
    authToken: "token314",
    evType: "sensorReading"
};  // params


const server = `${params.orgID}.messaging.internetofthings.ibmcloud.com`;
const port = 1883;


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
                readings = readings.concat(JSON.parse(reply));
            } catch (err) { showString(`Parse error ${err}`); }
        });  // app.HttpRequest
        
    showString(`Readings: ${readings.length}`);
};  // readData



// Send a reading 
const sendReading = (data) => {
    const xhr = new XMLHttpRequest();
    const path = `/api/v0002/device/types/${params.devType
        }/devices/${data.cpu}/events/${params.evType}`;

    const url = `http://${server}:${port}${path}`;    
    xhr.open("POST", url);    
    
    events = ["load", "progress", "error", "abort"];
    
    events.map(ev => xhr.addEventListener(ev, (cb) => alert(`${ev} says ${JSON.stringify(cb)}`)));

    xhr.setRequestHeader("Authorization", 
        "Basic " + btoa(`use-token-auth:${params.authToken}`));
    xhr.send(JSON.stringify({
        temp: data.temp, 
        humidity: data.humidity, 
        time: data.time})
    );   // xhr.send
}; // sendXhr    
    




const sendData = () => {
    const sendMe = readings;
    readings = [];
    
    showString(`Sending ${sendMe.length} readings`);
    
    sendMe.map(reading => sendReading(JSON.stringify(reading)));
};   // sendData




// Main loop
const mainLoop = () => {
	clearScreen();
	showString(`SSID: ${app.GetSSID()}`);
	showString(`IP: ${app.GetIPAddress()}`);
	showString(`Connected: ${app.IsConnected()}`);
	if (app.GetSSID() === '"barn_net"')
		readData();
	else
	// If we're connected to WiFi, and it's not barn_net, 
	// we can send the data to the cloud
	    if (app.IsConnected())
	        sendData();
	                          
};  // mainLoop


// Called when application is started.
const OnStart = () => {
    setInterval(mainLoop, 6000);
    mainLoop();
};   // OnStart
