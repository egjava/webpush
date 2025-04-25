const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
//const cors = require('cors')
const app = express();

// Set static path
app.use(express.static(path.join(__dirname, "client")));
//app.use(cors())
app.use(bodyParser.json());
const publicVapidKey =
    "BKCOr589xStA1gSVk_RDKlbtgnqSYxDWLcy6CJVFq7Bep9sqzS5rwM75RIZIiSBbhfkEtm38R7RFrjyk6-9F4yY";
const privateVapidKey = "O3UYIHzRdSvCooG3VaQrbnoW-V52U9lnR-FItS8_zZY";

webpush.setVapidDetails(
    'mailto:staging@gateaccess.org',
    publicVapidKey,
    privateVapidKey
);


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/myapp').then(() => console.log('Connected to MongoDB...')).catch((err) => console.error("Coudn't connect MongoDB....", err));

const pushNotificationSchema = new mongoose.Schema({
    endpoint: {
        type: Object,
        unique: true,
        index: true,
        required: true,
    },
    userID: String,
    browser: String,
    deviceID: String,
    failedDate: Date,
    });


const saveToDatabase = async (subscription, browserName, deviceID) => {
    // Since this is a demo app, I am going to save this in a dummy in memory store. Do not do this in your apps.
    // Here you should be writing your db logic to save it.
    const result = null;
    try {
        let pushNotification = mongoose.model('pushNotification', pushNotificationSchema);
       
        let pushNotifications = new pushNotification({ endpoint: subscription, userID: "235", browser: browserName, deviceID: deviceID, failedDate: null });
        result = await pushNotifications.save();
    }
    catch (error) {
        if (error.code === 11000) {
            console.error('Duplicate endpoint error. This subscription endpoint already exists!');
        } else {
            console.error('An error occurred:', error);
        }
    }
    console.log(result);
   
}
// Subscribe Route
app.post("/subscribe", (req, res) => {
    // Get pushSubscription object
    const subscription = req.body.subscription;
    const browserName = req.body.browserName;  
    const deviceID = req.body.deviceID;
    saveToDatabase(subscription, browserName, deviceID)    
    res.status(201).json({});
    const payload = JSON.stringify({ title: "Push Test by Elizabeth", message:"Elizabeth please check your email"});
  
    webpush
        .sendNotification(subscription, payload)
        .catch(err => console.error(err));
});
//function to send the notification to the subscribed device
const sendNotification = (subscription, dataToSend, deviceID) => {
   
    webpush.sendNotification(subscription, dataToSend).catch(err => {
        console.log("calling updateFailedTime")
        const result = updateFailedTime("235", subscription, deviceID);       
        return err;
    }).then(notification => { 
       // console.log("notification***", notification)
        if (notification && notification.statusCode === 201) {  
            console.log("calling removeFailedTime")
            removeFailedTime("235", subscription, deviceID);
        }
    });
}

const removeFailedTime = async (userID, subscription, deviceID) => { 
    let pushNotification = mongoose.model('pushNotification', pushNotificationSchema);
    const query = {
        userID: userID,
        endpoint: subscription,
        deviceID: deviceID,
        failedDate: { $ne: null }
    }
    const setFailedTime = {
        $set: {
            failedDate: null
        }
    }
    const result = await pushNotification.updateOne(query, setFailedTime)
 
    if (!result) {
        const error = `Subscription Endpoint: ${subscription} for the userID ${userID} was not found`
        console.error(error)
        return { errors: error }
    }
    return result
}
const updateFailedTime = async (userID, subscription, deviceID) => { 
    let pushNotification = mongoose.model('pushNotification', pushNotificationSchema);
    const utcNow = getUtcDateNow()
    const query = {
        userID: userID,
        endpoint: subscription,
        deviceID: deviceID,
        failedDate: null
    }
    const setFailedTime = {
        $set: {
            failedDate: utcNow
        }
    }

    const result = await pushNotification.updateOne(query, setFailedTime)
  
    if (!result) {
        const error = `Subscription Endpoint: ${subscription} for the userID ${userID} was not found`
        console.error(error)
        return { errors: error }
    }
    return result
}
const getUtcDateFromDate = (date) => {
    const utc_timestamp = Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds(),
    )
    return new Date(utc_timestamp)
}
const getUtcDateNow = () => {
    return getUtcDateFromDate(new Date())
}
const getSubscription = async() => {
    console.log("getSubscription")
    const pushNotification = mongoose.model('pushNotification', pushNotificationSchema);
    const notifications = await pushNotification.find();
    console.log("notificationssssssss", notifications)
    return notifications;
}
const getEndpointKey= async (userID, browserName,deviceID) => {
    console.log("getSubscription with UserID")
    const pushNotification = mongoose.model('pushNotification', pushNotificationSchema);
    const query = {
        userID: userID,
        browser: browserName,
        deviceID: deviceID
    };
    let data = await pushNotification.findOne(query);
    console.log("endpoint called", data)
    let endpoint = data.endpoint
    console.log("endpoint", endpoint)
    let keys = endpoint.keys.p256dh
    console.log("keys", keys)
   
    return keys;
}
app.get('/send-notification', async (req, res) => {
    console.log("send-notification")
    const subscription = await getSubscription(); //get subscription from your databse here.
    console.log("subscription***", subscription[0].endpoint);

    const payload = JSON.stringify({ title: "Second Push Test by Elizabeth", message: "Elizabeth please check your email" });
    subscription.forEach((x) => {
        console.log("Endpoint****", x.endpoint)
        sendNotification(x.endpoint, payload, x.deviceID)
    });
    return res.json({ message: 'message sent' })
})

app.get('/get', async (req, res) => {
    console.log("Get subscription***", req.query.userID, "browserNamae", req.query.browser);
    const result = await getEndpointKey(req.query.userID, req.query.browser, req.query.deviceID); //get subscription from your databse here.
   // console.log("subscription***", subscription[0].endpoint);

    //const payload = JSON.stringify({ title: "Second Push Test by Elizabeth", message: "Elizabeth please check your email" });
    console.log(result);
    //console.log(res.json({ data: result }))
    //return { data: data };
    let respJSON = {
        keys: result
    }
    const jsonString = JSON.stringify(respJSON);
    console.log("json result", jsonString)
    return res.json(jsonString)
})


app.delete("/unsubscribe", (req, res) => {
    // Get pushSubscription object
    const userID = req.query.userID
    const browser = req.query.browser
    const query = {
        userID: userID,
        browser: browser, 
        deviceID: deviceID,
    };
    console.log("query*****", query)
  
    deleteSubscription(query) //Method to save the subscription to Database
    // Send 201 - resource created
    console.log("deleted")
    res.status(201).json({ message: 'success' });
  
});

const deleteSubscription = async (query) => {
    console.log("deletesubscription with UserID")
    const pushNotification = mongoose.model('pushNotification', pushNotificationSchema);

    const deleted = await pushNotification.deleteOne(query);
    console.log("deleted", deleted)
    return deleted;
}
/*const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));*/
//for herokku
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));
