
const FBUtil =
{
  db: null,
  testMode: false,
  _firebase: null,

    init: ()=> {
    if(FBUtil._firebase)
      return;
    FBUtil._firebase = require("firebase");
    const firebaseConfig = {
      apiKey: "AIzaSyBvgDJ2EyxDaZervfY7yImDrvXE8R8Vzpo",
      authDomain: "un-peer-challenges.firebaseapp.com",
      databaseURL: "https://un-peer-challenges.firebaseio.com",
      projectId: "un-peer-challenges",
      storageBucket: "un-peer-challenges.appspot.com",
      messagingSenderId: "789085021989"
    };
    FBUtil._firebase.initializeApp(firebaseConfig);
  },

  connect: ()=> {
    // console.log("connecting");
    // console.log("db: " + db);
    if(FBUtil.db) {
      return FBUtil.db;
    }

    require("firebase/firestore");
    FBUtil.init();

    FBUtil.db = FBUtil._firebase.firestore();
    return FBUtil.db;

  }

}

export default FBUtil;