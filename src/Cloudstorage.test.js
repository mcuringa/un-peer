
const firebase = require("firebase");
require("firebase/storage");


const config = {
  apiKey: "AIzaSyBvgDJ2EyxDaZervfY7yImDrvXE8R8Vzpo",
  authDomain: "un-peer-challenges.firebaseapp.com",
  databaseURL: "https://un-peer-challenges.firebaseio.com",
  projectId: "un-peer-challenges",
  storageBucket: "un-peer-challenges.appspot.com",
  messagingSenderId: "789085021989"
};
firebase.initializeApp(config);

// Get a reference to the storage service, which is used to create references in your storage bucket
let storage = firebase.storage();

test("add image", ()=>{

  let storageRef = storage.ref();
  let testRef = storageRef.child('testing');
  expect(testRef).toBeDefined();
  console.log("got storage ref");

});