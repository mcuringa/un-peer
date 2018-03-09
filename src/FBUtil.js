// import _ from "lodash";
// import localforage from "localforage";
import {ChallengeDB} from "./challenges/Challenge.js";
import fireBaseConfig from "./firebase.config.json";
// import db from "./DBTools";


const FBUtil =
{
  db: null,
  testMode: false,
  _firebase: null,

  init: ()=> {
    const config = fireBaseConfig;
    console.log("Firebase Project: " + config.projectId);

    if(FBUtil._firebase)
      return FBUtil._firebase;
    
    FBUtil._firebase = require("firebase");
    require("firebase/auth");
    require("firebase/firestore");
    require("firebase/storage");



    FBUtil._firebase.initializeApp(config);
    return FBUtil._firebase;
  },

  uploadMedia: (file, path, progress, succ, err)=> {
    console.log("uploading media");
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

  }

}

export default FBUtil;