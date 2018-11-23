const params = {
    orgID: "86nt5n",
    devType: "Hay-Sensor",
    authToken: "token314",
    evType: "sensorReading",
    devID: "314"
};  // params


const server = `${params.orgID}.messaging.internetofthings.ibmcloud.com`;
const port = 1883;
const path = `/api/v0002/device/types/${params.devType}/devices/${params.devID}/events/${params.evType}`;

const url = `http://${server}:${port}${path}`;



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



// Send a reading 
const sendReading = (temp, humidity, time) => {
    const xhr = new XMLHttpRequest();
    
    xhr.open("POST", url);    
    xhr.setRequestHeader("Authorization", 
        "Basic " + btoa(`use-token-auth:${params.authToken}`));
    xhr.send(JSON.stringify({temp: temp, humidity:humidity, time: time}));
}; // sendXhr    
    



// Read data from the the Raspberry Pi
const readData = () => {
    var readings;
    
    app.HttpRequest("GET", "http://10.0.0.1/data", null, null, 
        (err, reply) => {
            if (err) {
                showString(`Err: ${err}`);
                showString(`${reply}`);
                
                return ;
            }  // if (err)
            
            try {
                readings = JSON.parse(reply);
            } catch (err) { showString(`Parse error ${err}`); }
        });  // app.HttpRequest
        
    showString(JSON.stringify(readings));
};  // readData




// Main loop
const mainLoop = () => {
	clearScreen();
	showString(`SSID: ${app.GetSSID()}`);
	showString(`IP: ${app.GetIPAddress()}`);
	if (app.GetSSID() === '"barn_net"')
		readData();
};  // mainLoop


// Called when application is started.
const OnStart = () => {
    setInterval(mainLoop, 6000);
    mainLoop();
};   // OnStart
