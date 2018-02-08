
const FBUtil =
{
  db: null,
  testMode: false,
  connect: ()=> {
    // console.log("connecting");
    // console.log("db: " + db);
    if(FBUtil.db)
      return FBUtil.db;
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
    firebase.initializeApp(firebaseConfig);
    FBUtil.db = firebase.firestore();


    // firebase.firestore().enablePersistence()
    //   .then(function() {
    //     FBUtil.db = firebase.firestore();
    //     console.log("db initialized");
    //     return FBUtil.db;
    //   })
    //   .catch(function(err) {
    //     if (err.code == 'failed-precondition') {
    //       console.log("oops...multiple windows, can't store data locally.");
    //     } else if (err.code == 'unimplemented') {
    //       console.log("browser doesn't support local storage.");
    //     }
    //   });

      throw("shouldn't get here");

  }

}

export default FBUtil;