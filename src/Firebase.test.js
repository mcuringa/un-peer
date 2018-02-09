// import challenges from './challenges.json';
// import _ from "lodash";
import FBUtil from "./FBUtil";

// let db = null;
// const connect = ()=> {
//   // console.log("connecting");
//   // console.log("db: " + db);
//   if(db)
//     return db;
//   const firebase = require("firebase");
//   require("firebase/firestore");

//   const firebaseConfig = {
//     apiKey: "AIzaSyBvgDJ2EyxDaZervfY7yImDrvXE8R8Vzpo",
//     authDomain: "un-peer-challenges.firebaseapp.com",
//     databaseURL: "https://un-peer-challenges.firebaseio.com",
//     projectId: "un-peer-challenges",
//     storageBucket: "un-peer-challenges.appspot.com",
//     messagingSenderId: "789085021989"
//   };
//   firebase.initializeApp(firebaseConfig);
//   db = firebase.firestore();
//   return db;

// };



it("load full challenge", ()=> {
  let db = FBUtil.connect();
  const id = "V5aUlDz4D4ZksPC577h1";
  console.log("start get one");
  db.collection("challenges").doc(id)
    .get()
    .then(async (doc)=>{
      challenge.id = id;
      console.log("start title");
      challenge = await doc.data();
      console.log(challenge.title);
      console.log("end title");
      owner = await challenge.owner;
      console.log(owner);

    });

  console.log("end get one");



});

it("loads data", ()=> {
  let db = FBUtil.connect();
  // let challenges = [];
  db.collection("challenges").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let c = doc.data();
      // challenges.push(c);
      console.log(c);
    });
  });
  // console.log(challenges);
  
});


