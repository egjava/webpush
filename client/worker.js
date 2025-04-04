console.log("Service Worker Loaded...");

self.addEventListener("push", e => {
    const data = e.data.json();
    console.log("Push Recieved...");
    self.registration.showNotification(data.title, {
        body: "Test Notification by Elizabeth!",
        icon: "https://gateaccess.org/images/ga_logo.svg"
    });
});