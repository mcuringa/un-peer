// import challenges from './challenges.json';
import _ from "lodash";

const firebase = require("firebase");
require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBvgDJ2EyxDaZervfY7yImDrvXE8R8Vzpo",
  authDomain: "un-peer-challenges.firebaseapp.com",
  databaseURL: "https://un-peer-challenges.firebaseio.com",
  projectId: "un-peer-challenges",
  storageBucket: "un-peer-challenges.appspot.com",
  messagingSenderId: "789085021989"
};


const ChallengeDB = {
  db: null,
  init: () => {
    if(ChallengeDB.db)
      return;

    firebase.initializeApp(firebaseConfig);
    ChallengeDB.db = firebase.firestore();

    // if(!ChallengDB.hasLocalStorage()) {
    //   ChallengeDB.db = firebase.firestore();
    //   return;
    // }

    // firebase.firestore().enablePersistence()
    //   .then(function() {
    //     ChallengeDB.db = firebase.firestore();
    //     console.log("db initialized");
    //   })
    //   .catch(function(err) {
    //     if (err.code == 'failed-precondition') {
    //       console.log("oops...multiple windows, can't store data locally.");
    //     } else if (err.code == 'unimplemented') {
    //       console.log("browser doesn't support local storage.");
    //     }
    //   });
  },
  
  hasLocalStorage: ()=>{
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    }
    catch(e) {
      return false;
    }
  },

  add: (c)=> {
    c.created = firebase.firestore.FieldValue.serverTimestamp();
    c.modified = firebase.firestore.FieldValue.serverTimestamp();
    ChallengeDB.db.collection("challenges").add(c);
  },
  
  findAll: (onload)=> {
    console.log('running find all');
    ChallengeDB.db.collection("challenges").get()
    .then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        let c = doc.data();
        _.delay((c)=>{console.log(c);}, 5000);


      });
    });
  },

  findById: (id)=> {
    // console.log("finding by id: " + id);
    return _.find(ChallengeDB.findAll(),(c)=>{ return c.id == id; });
  }
}

ChallengeDB.init();

export default ChallengeDB;
