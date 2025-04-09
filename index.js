const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// Set static path
app.use(express.static(path.join(__dirname, "client")));

app.use(bodyParser.json());

const publicVapidKey =
    "BKCOr589xStA1gSVk_RDKlbtgnqSYxDWLcy6CJVFq7Bep9sqzS5rwM75RIZIiSBbhfkEtm38R7RFrjyk6-9F4yY";
const privateVapidKey = "O3UYIHzRdSvCooG3VaQrbnoW-V52U9lnR-FItS8_zZY";

webpush.setVapidDetails(
    'mailto:staging@gateaccess.org',
    publicVapidKey,
    privateVapidKey
);

// Subscribe Route
app.post("/subscribe", (req, res) => {
    // Get pushSubscription object
    const subscription = req.body;
    //console.log("Subscription*****",subscription)
    // Send 201 - resource created
    res.status(201).json({});

    // Create payload
    const payload = JSON.stringify({ title: "Push Test by Elizabeth" });
   // console.log("Payloaddddddddd", payload)
    // Pass object into sendNotification
    webpush
        .sendNotification(subscription, payload)
        .catch(err => console.error(err));
});

/*const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));*/
//for herokku
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));
