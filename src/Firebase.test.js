import config from "./firebase.config.json";
import FBUtil from "./FBUtil";

let firebase = require("firebase");
require("firebase/auth");
require("firebase/firestore");
require("firebase/storage");
require("firebase/messaging");

firebase.initializeApp(config);

require("firebase/functions")

it("inits messaging",()=>{
  
  const messaging = firebase.messaging();  
  messaging.usePublicVapidKey(config.vapidPublicKey);

  messaging.requestPermission().then(()=>{
    console.log('Notification permission granted.');
    console.log("hello, messaging");
    // TODO(developer): Retrieve an Instance ID token for use with FCM.
    // ...
  

  }).catch((err)=>{
    console.log('Unable to get permission to notify.', err);
  });

  


});



// it("initializes a database connection",()=>{
//     console.log("initializing");
//   let db = firebase.firestore();
//   expect(db).toBeDefined();
// })

// it.skip("can load functions",()=>{
//   let functions = firebase.functions();
//   expect(functions).toBeDefined();

// })

// it.skip("calls the hello function",()=>{
//   let functions = firebase.functions();
//   const hello = functions.httpsCallable("hello");
//   expect(hello).toBeDefined();
// })

// it.skip("authenticates with test email",()=>{

//   const email = "foo@example.com";
//   const pw = "foobar";
//   return firebase.auth().signInWithEmailAndPassword(email, pw)
//     .then(()=>{
//       console.log("signed in");
//     }).catch((e)=>{
//       console.log(e);
//     });
// })