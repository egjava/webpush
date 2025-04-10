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
const dummyDb = { subscription: null } //dummy in memory store
const saveToDatabase = async subscription => {
    // Since this is a demo app, I am going to save this in a dummy in memory store. Do not do this in your apps.
    // Here you should be writing your db logic to save it.
    dummyDb.subscription = subscription
}
// Subscribe Route
app.post("/subscribe", (req, res) => {
    // Get pushSubscription object
    const subscription = req.body;
    console.log("Subscription*****", subscription)
    dummyDb.subscription = subscription
    //const saved = await saveToDatabase(subscription) //Method to save the subscription to Database
    console.log("saved")
    // Send 201 - resource created
   // res.status(201).json({});

    // Create payload
    const payload = JSON.stringify({ title: "Push Test by Elizabeth", message:"Elizabeth please check your email"});
    console.log("Payloaddddddddd", payload)
    // Pass object into sendNotification
    webpush
        .sendNotification(subscription, payload)
        .catch(err => console.error(err));
});
//function to send the notification to the subscribed device
const sendNotification = (subscription, dataToSend) => {
    webpush.sendNotification(subscription, dataToSend)
}
app.get('/send-notification', async (req, res) => {
    console.log("send-notification")
    const subscription = dummyDb.subscription //get subscription from your databse here.
    console.log("subscription***", subscription);
    const payload = JSON.stringify({ title: "Second Push Test by Elizabeth", message: "Elizabeth please check your email" });
    sendNotification(subscription, payload)
    res.json({ message: 'message sent' })
})
/*const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));*/
//for herokku
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));
