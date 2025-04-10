console.log("Service Worker Loaded...");

self.addEventListener("push", e => {
    const data = e.data.json();
    console.log("Push Recieved...");
    console.log("message:", data.message);
   // alert("message", data.message);
    self.registration.showNotification(data.title, {
        body: data.message,
        icon: "https://gateaccess.org/images/ga_logo.svg"
    });
});