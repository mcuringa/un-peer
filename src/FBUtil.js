import _ from "lodash"
import {ChallengeDB} from "./challenges/Challenge.js";
import fireBaseConfig from "./firebase.config.json";
import db, {uuid} from "./DBTools";
import notifications from "./Notifications";

const FBUtil =
{
  db: null,
  testMode: false,
  _firebase: null,
  dbLock: false,

  init: async ()=> {
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
    FBUtil.db = await FBUtil.initDB();

    return FBUtil._firebase;
  },

  getFB: ()=> {
    return FBUtil._firebase;
  },

  enableMessaging() {

    const messaging = FBUtil._firebase.messaging();  
    messaging.usePublicVapidKey(fireBaseConfig.vapidPublicKey);
    let user = FBUtil._firebase.auth().currentUser;

    const sendTokenToServer = (token)=>{db.update("/users",user.uid, {pushToken: token});};
    const handleToken = (currentToken)=> {
      try {
        if (currentToken) {
          sendTokenToServer(currentToken);
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
      notifications.notify();
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
    console.log("begin file upload");
    let firebase = FBUtil.getFB();
    let storageRef = firebase.storage().ref();
    const name = ChallengeDB.slug(file.name);
    console.log("file", name);
    const id = uuid();
    path = `${path}/${id}/${name}`;
    console.log("full path", path);

    let ref = storageRef.child(path);

    // return new Promise(async (resolve, reject) => {
    //   let uploadTask = ref.put(file);
    //   const done = ()=>{succ(uploadTask)}
    //   uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, progress, err, done );
    // });

    let uploadTask = ref.put(file);
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, progress, err, succ );
    return uploadTask;

  },

  getAuthUser: (listener)=>
  {
    const auth = (resolve,reject)=> {
   
      let user = FBUtil._firebase.auth().currentUser;
      FBUtil._firebase.auth().onAuthStateChanged(listener);

      resolve(user);

    }

    return new Promise(auth);
  },

  _initDB: async ()=>{
    let db = FBUtil._firebase.firestore();
    const settings = { timestampsInSnapshots: true };
    db.settings(settings);
    // const offlineSupported = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

    // if(offlineSupported) {
    //   console.log("enabling offline data");
    //   await db.enablePersistence();
    // }
    
    FBUtil.db = db;

    return FBUtil.db;

  },

  initDB: async ()=> {
    let db = FBUtil._firebase.firestore();
    const settings = { timestampsInSnapshots: true };
    db.settings(settings);
    const init = (resolve, reject)=> {
      const enabled = ()=> {
        console.log("enabled persistence");
        resolve(db);
      }
      const notEnabled = ()=> {
        console.log("failed to enable persistence");
        resolve(db);
      }

      db.enablePersistence().then(enabled, notEnabled);
    }

    return new Promise(init);

  },

  connect: async (timeout)=> {
    // return the maldito database fron initDB
    if(!_.isNil(FBUtil.db)) {
      return FBUtil.db;
    }

    const wait = async (t)=>{ 
      return new Promise(resolve => {
        setTimeout(resolve, t);
      });
    }
    timeout = (timeout)?timeout * timeout: 50;
    await wait(timeout);
    return FBUtil.connect(timeout);
    
  },

  getCloudFunction: (f)=> {
    FBUtil.init();
    const functions = FBUtil._firebase.functions();
    return functions.httpsCallable(f);
  }

}

export default FBUtil;