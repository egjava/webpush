const publicVapidKey =
    "BKCOr589xStA1gSVk_RDKlbtgnqSYxDWLcy6CJVFq7Bep9sqzS5rwM75RIZIiSBbhfkEtm38R7RFrjyk6-9F4yY";
   
alert('here');
const main = async () => {
    alert("inside main")
    check();
    const permission = await requestNotificationPermission();
    const swRegistration = await registerServiceWorker();
};
const check = () => {
    alert("inside check")
    if (!("serviceWorker" in navigator)) {
        alert("No Service Worker support!");
        throw new Error("No Service Worker support!");
    }
    else {
        alert("serviceworker ready");
        console.log("serviceworker:", navigator.serviceWorker);
    }
   /* if (!("PushManager" in window)) {
        alert("No Push API Support!");
        if (!isPushManagerActive(pushManager)) {
            alert("not active return");
            return;
        }
        throw new Error("No Push API Support!");
    }
    else {
        alert("PushManager ready");
    }*/
};

function isPushManagerActive(pushManager) {
    alert("isPushmanager");
    if (!pushManager) {
        if (!window.navigator.standalone) {
            alert("inside standalone");
            //document.getElementById('add-to-home-screen').style.display = 'block';
        } else {
            alert("PushManager not active");
            throw new Error('PushManager is not active');
        }
        alert("before subscribebtn");
       // document.getElementById('subscribe_btn').style.display = 'none';
        return false;
    } else {
        return true;
    }
}


const registerServiceWorker = async () => {
    alert("inside registerservicworker");
      const swRegistration = await navigator.serviceWorker.register("/worker.js");
    console.log('[Service Worker] Registered. Scope::', swRegistration.scope);
    alert('[Service Worker] Registered. Scope::', swRegistration.scope);
    console.log("Service Worker Registered...");
    //const registration = await navigator.serviceWorker.ready; // Here's the waiting
   const register = await navigator.serviceWorker.ready;
    alert('register ready')
    alert(register);
    console.log("registereeeeeeeeee", register)
    let pushManager = register.pushManager;
    if (!isPushManagerActive(pushManager)) {
        alert("no pushmanager");
        return;
    }
    /*if (!swRegistration.pushManager) {
        alert("not registered pushmanager")
        throw { errorCode: "PushManagerUnavailable" };
    } else {
        alert("registered pushmanager")
    }*/
    // Register Push
    console.log("Registering Push...");
    alert("Registering Push...");
    const subscription = await pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    }).catch((err) => { return console.log('Web Push] Registration Error:', err) });
    console.log("Push Registered...");
    alert("Push Registered...");
    alert("Sending Push...");
    // Send Push Notification
    const response = await saveSubscription(subscription);
    console.log(response);
    console.log("Push Sent...");
    alert("Push Sent...");
    // return swRegistration;
};
// Check for service worker
/*if ("serviceWorker" in navigator) { 
    alert('calling send');
    send().catch(err => console.error(err));
}
else {
    alert("am not here");
}

// Register SW, Register Push, Send Push
async function send() {
    // Register Service Worker
    console.log("Registering service worker...");
    alert("Registering service worker..");
    const register = await navigator.serviceWorker.register("/worker.js", {
        scope: "/"
    }).catch((err) => { return console.log('[Service Worker] Registration Error:', err) })
    console.log('[Service Worker] Registered. Scope::', register.scope);
    alert('[Service Worker] Registered. Scope::', register.scope);
    console.log("Service Worker Registered...");
    //const registration = await navigator.serviceWorker.ready; // Here's the waiting
    await navigator.serviceWorker.ready;
    alert('register ready')
    if (!register.pushManager) {
        alert("not registered pushmanager")
        throw { errorCode: "PushManagerUnavailable" };
    } else {
        alert("registered pushmanager")
    }
    // Register Push
    console.log("Registering Push...");
    alert("Registering Push...");
    const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    }).catch((err) => { return alert('Web Push] Registration Error:', err) });
    console.log("Push Registered...");
    alert("Push Registered...");
    alert("Sending Push...");
    // Send Push Notification
    console.log("Sending Push...");
    await fetch("/subscribe", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: {
            "content-type": "application/json"
        }
    });
    console.log("Push Sent...");
   alert("Push Sent...");
}*/
const saveSubscription = async subscription => {
    alert('calling save subscription');
    //const SERVER_URL = `${hostName}/subscribe`;
    const response = await fetch("/subscribe", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: {
            "content-type": "application/json"
        }
    });
   /* const response = await fetch(SERVER_URL, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(subscription)
    });*/
    return response.json();
};


const requestNotificationPermission = async () => {
    alert("inside requestNotificationPermission");
    const permission = await window.Notification.requestPermission();
    console.log("permission", permission);
    switch (permission) {
        case 'prompt':
            alert("prompt");
            break;
        case 'granted':
            alert("granted");
            break;
        case 'denied':
            alert('User denied push permission');
        case 'default':
            alert('default');
    }
    // value of permission can be 'granted', 'default', 'denied'
    // granted: user has accepted the request
    // default: user has dismissed the notification permission popup by clicking on x
    // denied: user has denied the request.
    
    Notification.requestPermission().then(function (permission) {
        console.log('permiss', permission)
    });
    if (permission !== "granted") {
        alert("permission not granted");
        throw new Error("Permission not granted for Notification");
    }
};

const send = async () => {
    alert("inside send")
   // const SERVER_URL = `${hostName}/send-notification`;
   // console.log("Server_url send****", SERVER_URL)
    const response = await fetch("/send-notification", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },

    });
    
    return response.json();

};
function urlBase64ToUint8Array(base64String) {
    alert("urlBase64ToUint8Array");
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    alert("outputArray");
    return outputArray;
}