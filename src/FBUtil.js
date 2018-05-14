// import _ from "lodash";
// import localforage from "localforage";
import {ChallengeDB} from "./challenges/Challenge.js";
import fireBaseConfig from "./firebase.config.json";
import db from "./DBTools";
import notifications from "./Notifications";


const FBUtil =
{
  db: null,
  testMode: false,
  _firebase: null,

  init: ()=> {
    const config = fireBaseConfig;

    if(FBUtil._firebase)
      return FBUtil._firebase;

    console.log("Firebase Project: " + config.projectId);
    
    FBUtil._firebase = require("firebase");
    require("firebase/auth");
    require("firebase/firestore");
    require("firebase/storage");
    require("firebase/messaging");


    FBUtil._firebase.initializeApp(config);
    require("firebase/functions");


    return FBUtil._firebase;
  },

  enableMessaging() {

    // console.log("enabling messaging with key", fireBaseConfig.vapidPublicKey);


    const messaging = FBUtil._firebase.messaging();  
    messaging.usePublicVapidKey(fireBaseConfig.vapidPublicKey);
    let user = FBUtil._firebase.auth().currentUser;

    const sendTokenToServer = (token)=>{db.update("/users",user.uid, {pushToken: token});};
    const handleToken = (currentToken)=> {
      try {
        if (currentToken) {
          sendTokenToServer(currentToken);
          console.log("token", currentToken);
        } else {
          console.log('No Instance ID token available. Request permission to generate one.');
        }
      }
      catch(err) {
        console.log('An error occurred while retrieving token. ', err);
      }
    }

    const updateToken = ()=>{ messaging.getToken().then(handleToken); };
    const pushMessage =(msg)=> {
      console.log('Message received. ', msg);
      notifications.add(msg);
    }

    let chan = new MessageChannel();
    chan.port1.onmessage = pushMessage;
    chan.port1.addEventListener('message', pushMessage);

    messaging.onTokenRefresh(updateToken);
    messaging.requestPermission().then(()=>{
      console.log('Notification permission granted.');
      updateToken();
    }).catch((err)=>{
      console.log('Unable to get permission to notify.', err);
    });
    
    messaging.onMessage(pushMessage);

  
  },

  sendPasswordResetEmail: (email)=> {
    FBUtil.init();
    return FBUtil._firebase.auth().sendPasswordResetEmail(email); 
  },

  uploadMedia: (file, path, progress, succ, err)=> {
    let firebase = FBUtil.init();
    let storageRef = firebase.storage().ref();
    const name = ChallengeDB.slug(file.name);
    path = `${path}/${name}`;

    let ref = storageRef.child(path);

    return new Promise(async (resolve, reject) => {
      let uploadTask = ref.put(file);
      const done = ()=>{succ(uploadTask)}
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, progress, err, done );
    });
  },

  getAuthUser: (listener)=>
  {
    const auth = (resolve,reject)=> {
      FBUtil.init();
      
      let user = FBUtil._firebase.auth().currentUser;
      FBUtil._firebase.auth().onAuthStateChanged(listener);

      resolve(user);

    }

    return new Promise(auth);
  },

  connect: ()=> {
    // console.log("connecting");
    // console.log("db: " + db);
    if(FBUtil.db) {
      return FBUtil.db;
    }

    FBUtil.init();

    FBUtil.db = FBUtil._firebase.firestore();
    return FBUtil.db;
  },

  getCloudFunction: (f)=> {
    FBUtil.init();
    const functions = FBUtil._firebase.functions();
    return functions.httpsCallable(f);
  }

}

export default FBUtil;