import {ChallengeDB} from "./challenges/Challenge.js";
// import localforage from "localforage";
import fireBaseConfig from "./firebase.config.json";



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

    return new Promise((resolve, reject) => {
      let uploadTask = ref.put(file);
      const done = ()=>{succ(uploadTask)}
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, progress, err, done );
    });
  },


  connect: ()=> {




    const persist = (resolve, reject)=>
    {

      const fallBack = (e)=>{
        console.log("failed to init firebase with persistence");
        console.log(e);
        let db = FBUtil._firebase.firestore();
        resolv(db);

      };
      const f = ()=>{
        let db = FBUtil._firebase.firestore();
        resolve(db);
      };
      console.log("initializing fb with persistence");
      FBUtil._firebase.firestore().enablePersistence()
      .then(resolve(db))
      .catch(fallback);
    }
    return new Promise(persist);
  }

}

export default FBUtil;