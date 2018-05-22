importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

console.log("fb msg sw without local");

const alertClient = (payload) => {

  console.log("alert client called");
  let chan = new MessageChannel();
  clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(payload, [chan.port1]);
    })
  })
}


firebase.initializeApp({ 'messagingSenderId': "789085021989"});
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler((payload)=>{

  console.log("bg msg recieved");
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    "body": payload.notification.body,
    "icon": 'https://un-peer-challenges.firebaseapp.com/img/home.png',
    "badge": 'https://un-peer-challenges.firebaseapp.com/img/home.png',
    "click_action": payload.data.clickAction || "http://www.example.com"
  };
  alertClient(payload);

  return self.registration.showNotification(notificationTitle, notificationOptions);

});



