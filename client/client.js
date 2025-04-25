const publicVapidKey =
    "BKCOr589xStA1gSVk_RDKlbtgnqSYxDWLcy6CJVFq7Bep9sqzS5rwM75RIZIiSBbhfkEtm38R7RFrjyk6-9F4yY";

const main = async () => {  
    const isMobile = isMobileBrowser() || isMobileBrowserTouch() || isMobileBrowserScreenSize();
    if (isMobile) { 
        //const { v4: uuidv4 } = require('uuid');
        alert("yes its mobile")
        check();    
        await subscribeUser();
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
    alert(browserName)
    navigator.serviceWorker.ready
        .then(registration => {          
            let pushManager = registration.pushManager;
            if (!isPushManagerActive(pushManager)) {  
                alert("pushmanager not active")
                return;
            }
            else {
                registration.pushManager.getSubscription()
                    .then(pushSubscription => {
                        let oldPublicKey = "";                       
                        if (!pushSubscription) { 
                            alert("no push subscription")
                            //the user was never subscribed or deleted history/cookies
                          /*  getEndpointKey("235", browserName).then(result => {
                                oldPublicKey = result.keys;                              
                                return oldPublicKey; 
                            }).then(oldPublicKey => {
                                alert(oldPublicKey)
                                if (oldPublicKey) { 
                                    const uuid = await getDeviceUUID();   
                                    console.log("uuid:", uuid);
                                    unsubscribe("235", browserName, uuid)                                   
                                }
                                subscribe(registration);
                            });*/
                            subscribe(registration);
                        }
                        else {
                            alert("we have push subscription")
                            let json = pushSubscription.toJSON();
							console.log("json***", json);
                            let public_key = json.keys.p256dh;  
                            let deviceID = getMachineId();
                            console.log("deviceIDDDD", deviceID)
                            getEndpointKey("235", browserName, deviceID).then(result => {                                
                                oldPublicKey = result.keys;                             
                                return oldPublicKey; 
                            }).then(oldPublicKey => {   
                                alert(oldPublicKey)
                                if (public_key != oldPublicKey) {
                                    pushSubscription.unsubscribe().then(successful => {                                     
                                        unsubscribe("235", browserName, deviceID)                                       
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
    alert("subscribe")
    registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    })
        .then(pushSubscription => {          
            // Send Push Notification
            const response = saveSubscription(pushSubscription);          
        });
}

const unsubscribe = async (userID, browserName,deviceID) => {
    const url = `/unsubscribe?userID=${userID}&browser=${browserName}&device=${deviceID}`
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
    alert("saveSubscription")
    const browserName = getBrowserName();  
    const deviceID = getMachineId();
    console.log("deviceID******", deviceID)
    const response = await fetch("/subscribe", {
        method: "POST",
        body: JSON.stringify({ subscription, browserName, deviceID }),
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

const getEndpointKey = async (userID, browserName, deviceID) => {
    const url = `/get?userID=${userID}&browser=${browserName}&deviceID=${deviceID}`;
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
    alert("calling notification permission")
    const permission = await window.Notification.requestPermission();
  alert(permission)
    if (permission === "granted") {        
        main();
        //check();
        //await subscribeUser();
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
    alert(navigator.userAgent)
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
     
    }
    return false;
}

function isMobileBrowserTouch() {   
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/*function isMobile() {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
            check = true;
    })(navigator.userAgent || window.opera);
    return check;
}*/

function getMachineId() {
    let machineId = localStorage.getItem('MachineId');
    console.log("machineID***", machineId)
    if (!machineId) {
        machineId = crypto.randomUUID();
        localStorage.setItem('MachineId', machineId);
        console.log("generate machineID***", machineId)
    }
    return machineId;
}

/*function getDeviceUUID() {
    let deviceUUID = document.cookie.split('; ').find(row => row.startsWith('deviceUUID='));
    if (!deviceUUID) {
        deviceUUID = `deviceUUID=${uuidv4()}`;
        document.cookie = deviceUUID;
    } else {
        deviceUUID = deviceUUID.split('=')[1];
    }
    console.log(`Device UUID: ${deviceUUID}`);
    return deviceUUID;
}

function isMobileTablet() {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
            check = true;
    })(navigator.userAgent || window.opera);
    return check;
}*/

function isMobileBrowserScreenSize() {   
    return window.innerWidth <= 768;
}

/*function detectDevice() {
    const userAgent = navigator.userAgent;

    if (userAgent.match(/iPad/i)) {
        return 'iPad';
    } else if (userAgent.match(/iPhone/i)) {
        return 'iPhone';
    } else if (userAgent.match(/Android/i) && userAgent.match(/Mobile/i)) {
        return 'Android Phone';
    } else if (userAgent.match(/Android/i)) {
        return 'Android Tablet';
    } else {
        return 'Unknown Device';
    }
}*/







