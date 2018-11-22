

const params = {
    orgID: "86nt5n",
    devType: "Hay-Sensor",
    authToken: "token314",
    evType: "sensorReading",
    devID: "314"
};  // params


const server = `${params.orgID}.messaging.internetofthings.ibmcloud.com`;
const path = `/api/v0002/device/${params.devType}/devices/${params.devID}/events/${params.evType}`;


/*
const httpHeader = `
Content-Type: application/json
use-token-auth: ${authToken}
`;
*/

//Create a layout with objects vertically centered.
var	lay = app.CreateLayout( "linear", "VCenter,FillXY" );	


const connected = conn => {
    
    lay.AddChild(app.CreateText(conn.IsConnected()));
    
    conn.SendText(`
POST ${path} HTTP/1.1\r\n
Host: ${server}\r\n
Content-Type: application/json\r\n
use-token-auth: ${params.authToken}\r\n
\r\n
{\r\n
   "temp": 3,\r\n
   "humidity": 10\r\n
}\r\n
\r\n
    `, "UTF-8");    
};   // connected


const receive = conn => {
    const str = conn.ReceiveText("UTF-8");
    lay.AddChild(app.CreateText(`recv: ${str}`));
};


// Send sensor readings
const sendSensor = (temp, humidity, timestamp) => {
    const conn = app.CreateNetClient("TCP");
    conn.Connect(server, 80);
    conn.SetOnConnect(() => connected(conn));
    conn.SetOnReceive(() => receive(conn));
    
    lay.AddChild(app.CreateText(server));
    lay.AddChild(app.CreateText(path));     
};  // sendSensor


// Called when application is started.
const OnStart = () => {
	//Create a text label and add it to layout.
	txt = app.CreateText( "Hello" );
	txt.SetTextSize( 32 );
	lay.AddChild( txt );
	
	sendSensor(2, 3, 4);
	
	//Add layout to app.	
	app.AddLayout( lay );
}   // OnStart

