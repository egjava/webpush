const publicVapidKey =
    "BKCOr589xStA1gSVk_RDKlbtgnqSYxDWLcy6CJVFq7Bep9sqzS5rwM75RIZIiSBbhfkEtm38R7RFrjyk6-9F4yY";

const main = async () => {  
    const isMobile = isMobileBrowser() || isMobileBrowserTouch() || isMobileBrowserScreenSize();
    if (isMobile) {     
        check();       
    } else {       
        console.log('Desktop browser');
    }   
};
const check = () => {   
    if (!("serviceWorker" in navigator)) {       
        throw new Error("No Service Worker support!");
    }
   
     if (!("PushManager" in window)) {       
         if (!isPushManagerActive(pushManager)) {            
             return;
         }
         throw new Error("No Push API Support!");
     }     
};

function isPushManagerActive(pushManager) {   
    if (!pushManager) {
        if (!window.navigator.standalone) {           
            //document.getElementById('add-to-home-screen').style.display = 'block';
        } else {           
            throw new Error('PushManager is not active');
        }
        return false;
    } else {
        return true;
    }
}

const subscribeUser = async () => {   
    const swRegistration = await navigator.serviceWorker.register("/worker.js");
    const browserName = getBrowserName(); 
    navigator.serviceWorker.ready
        .then(registration => {          
            let pushManager = registration.pushManager;
            if (!isPushManagerActive(pushManager)) {              
                return;
            }
            else {
                registration.pushManager.getSubscription()
                    .then(pushSubscription => {
                        let oldPublicKey = "";                       
                        if (!pushSubscription) {
                            //the user was never subscribed                              
                            getEndpointKey("235", browserName).then(result => {
                                oldPublicKey = result.keys;                              
                                return oldPublicKey; 
                            }).then(oldPublicKey => {
                                if (!oldPublicKey) {                                 
                                    unsubscribe("235", browserName)                                   
                                }
                                subscribe(registration);
                            });
                        }
                        else {
                            let json = pushSubscription.toJSON();
                            let public_key = json.keys.p256dh;                         
                            getEndpointKey("235", browserName).then(result => {                                
                                oldPublicKey = result.keys;                             
                                return oldPublicKey; 
                            }).then(oldPublicKey => {                               
                                if (public_key != oldPublicKey) {
                                    pushSubscription.unsubscribe().then(successful => {                                     
                                        unsubscribe("235", browserName)                                       
                                        subscribe(registration);
                                    }).catch(e => {
                                        console.log("unsubscription failed")                                       
                                    })
                                }
                            });
                        }
                    });
            }
        })
}


const subscribe = async (registration) => {
    registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    })
        .then(pushSubscription => {          
            // Send Push Notification
            const response = saveSubscription(pushSubscription);          
        });
}

const unsubscribe = async (userID, browserName) => {
    const url = `/unsubscribe?userID=${userID}&browser=${browserName}`
    const response = fetch(url, {
        method: "DELETE",       
        headers: {
            "content-type": "application/json"
        }
    });
    return response.json;
}

const registerServiceWorker = async () => {   
    const swRegistration = await navigator.serviceWorker.register("/worker.js");
    const register = await navigator.serviceWorker.ready;
   
    let pushManager = register.pushManager;
    if (!isPushManagerActive(pushManager)) {      
        return;
    }
  
    const subscription = await pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    }).catch((err) => { return console.log('Web Push] Registration Error:', err) });
   
    const response = saveSubscription(subscription);
   
};

const saveSubscription = async subscription => {  
    const browserName = getBrowserName();  
    const response = await fetch("/subscribe", {
        method: "POST",
        body: JSON.stringify({ subscription, browserName }),
        headers: {
            "content-type": "application/json"
        }
    });   
    return response.json();
};


function getBrowserName (){
    const userAgent = navigator.userAgent;   
    let data = "";
    if (userAgent.includes("Edg")) {
        data = "Microsoft Edge";
        return data;
    }
    else if (userAgent.includes("Firefox")) {     
        data = "Mozilla Firefox";
        return data;
    } else if (userAgent.includes("Chrome")) {
        data = "Google Chrome";
        return data;        
    } else if (userAgent.includes("Safari")) {
        data = "Apple Safari";
        return data;      
    } else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) {
        data = "Microsoft Internet Explorer";
        return data;          
    } else {
        return "Unknown Browser";
    }
}

const getEndpointKey = async (userID, browserName) => {
    const url = `/get?userID=${userID}&browser=${browserName}`;
    let dataReceived = ""; 
    await fetch(url, {
        method: "GET",     
        headers: {
            "content-type": "application/json"
        }
    }).then(resp => {
        if (resp.status === 200) {
            return resp.json()
        } else {           
            return Promise.reject("server")
        }
    })
        .then(dataJson => {
            dataReceived = JSON.parse(dataJson)
        })
        .catch(err => {
            if (err === "server") return
            console.log(err)
        })

    return dataReceived;
};

const requestNotificationPermission = async () => {
    const permission = await window.Notification.requestPermission();
  
    if (permission === "granted") {        
        main();
        check();
        await subscribeUser();
    }
    
};

const send = async () => {
     const response = await fetch("/send-notification", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    });

    return response.json();

};
function urlBase64ToUint8Array(base64String) {   
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
function isMobileBrowser() { 
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    }
    return false;
}

function isMobileBrowserTouch() {   
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

function isMobileBrowserScreenSize() {   
    return window.innerWidth <= 768;
}

