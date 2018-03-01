import {ChallengeDB} from "./challenges/Challenge.js";
// import localforage from "localforage";
import fireBaseConfig from "./firebase.config.json";


const FBUtil =
{
  db: null,
  testMode: false,
  _firebase: null,

  init: ()=> {
    if(FBUtil._firebase)
      return FBUtil._firebase;
    
    FBUtil._firebase = require("firebase");
    require("firebase/auth");
    require("firebase/firestore");
    require("firebase/storage");

    const firebaseConfig = {
      apiKey: "AIzaSyBvgDJ2EyxDaZervfY7yImDrvXE8R8Vzpo",
      authDomain: "un-peer-challenges.firebaseapp.com",
      databaseURL: "https://un-peer-challenges.firebaseio.com",
      projectId: "un-peer-challenges",
      storageBucket: "un-peer-challenges.appspot.com",
      messagingSenderId: "789085021989"
    };
    FBUtil._firebase.initializeApp(firebaseConfig);
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