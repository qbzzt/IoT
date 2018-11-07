const app = express();

var readings = [];

const addReading = (cpu, temp, humidity) => {
        readings[readings.length] = {
                cpu: cpu,
                temp: temp,
                humidity: humidity,
                time: Date.now()
        };
};


// Report the readings, and delete them.
const getReadings = () => {
        const retVal = JSON.stringify(readings);
        readings = [];

        return retVal;
};


app.get("/:cpu/:temp/:humidity", (req, res) => {
        res.send("OK");
        addReading(req.params.cpu, req.params.temp, req.params.humidity);
});


app.get("/data", (req, res) => {
        res.send(getReadings());
});

app.listen(80, "0.0.0.0");
