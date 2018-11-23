

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
 

const sendReading = (temp, humidity) => {
    const xhr = new XMLHttpRequest();
    
    xhr.open("POST", url);    
    xhr.setRequestHeader("Authorization", 
        "Basic " + btoa(`use-token-auth:${params.authToken}`));
    xhr.send(JSON.stringify({temp: temp, humidity:humidity}));
}; // sendReading    
    
    

// Called when application is started.
const OnStart = () => {		
	sendReading(90,90);	
}   // OnStart

