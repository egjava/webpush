const publicVapidKey =
    "BKCOr589xStA1gSVk_RDKlbtgnqSYxDWLcy6CJVFq7Bep9sqzS5rwM75RIZIiSBbhfkEtm38R7RFrjyk6-9F4yY";
   
alert('here');
// Check for service worker
if ("serviceWorker" in navigator) { 
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
    await navigator.serviceWorker.ready; // Here's the waiting
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
}

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