import {ChallengeDB} from "./challenges/Challenge.js";
// import localforage from "localforage";


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

  uploadMedia: (file, path, registerHandler)=> {
    console.log("uploading media");
    let firebase = FBUtil.init();
    let storageRef = firebase.storage().ref();
    const name = ChallengeDB.slug(file.name);
    console.log("filename: " + name);
    path = `${path}/${name}`;
    console.log("uploading to: " + path);

    let ref = storageRef.child(path);


    return new Promise(async (resolve, reject) => {
      let uploadTask = ref.put(file).then((snapshot)=> {
        console.log("upload complete");
        resolve(snapshot);
      });
      
      if(registerHandler) {
        console.log("registering handler");
        registerHandler(uploadTask);
      }


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