const functions = require('firebase-functions');
// const config = require("./src/firebase.config.json");
let admin = null;
let db = null;

if(!admin){
  admin = require('firebase-admin');
  // admin.initializeApp(functions.config().firebase); // this is from messaging


  admin.initializeApp({
      credential: admin.credential.applicationDefault()
  });
}

const getDB = ()=> {
  return db = db || admin.firestore();
}


const logErr = (e)=>{ console.log(e); }

const sendUserNotification = (uid, msg)=> {
  console.log("sending", msg);
  // Send a message to the device corresponding to the provided
  // registration token.
  const send = (doc)=> {
    const user = doc.data();
    msg.token = user.pushToken;
    return admin.messaging().send(msg)
    .then((response) => {
      return response;
    })
  }

  let db = getDB();
  return db.collection("/users").doc(uid).get().then(send).catch(logErr); 

}


const statusChange = (before, after)=> {
  const DRAFT = 1;
  const REVIEW = 2;
  const PUBLISHED = 3;
  const DELETE = 4;
  const REJECT = 5;

  let data = {
    "challengeId": after.id,
    "challengeTitle": after.title,
    "sent": new Date().toISOString(),
    "icon": 'https://un-peer-challenges.firebaseapp.com/img/home.png',
  }
  before.status = parseInt(before.status);
  after.status = parseInt(after.status);

  // console.log("is before.review", before.status === REVIEW);
  // console.log("is after.reject", after.status === REJECT);
  // console.log("is after.published", after.status === PUBLISHED);

  if(before.status === REVIEW && after.status === REJECT) {
    console.log("reject");
    const notification = {
        "title": "Challenge Rejected",
        "body": `The challenge you submitted was not chosen as a challenge of the week.`
    }
    data.clickAction = "https://un-peer-challenges.firebaseapp.com/my/challenges";
    const msg = { "notification": notification, "data": data}
    return sendUserNotification(before.owner.uid, msg);
  }

  if(before.status === REVIEW && after.status === PUBLISHED) {
    console.log("accept");
    const notification = {
        "title": "Challenge Accepted",
        "body": `Your challenge was chosen as a challenge of the week.`
    }
    data.clickAction = `https://un-peer-challenges.firebaseapp.com/challenge/${data.challengeId}`;

    const msg = { "notification": notification, "data": data}
    return sendUserNotification(before.owner.uid, msg);
  }


  return "no action";

}

exports.challengeUpdate = functions.firestore.document("challenges/{id}").onUpdate((change, b, c, d)=> {

  const after = change.after.data();
  const before = change.before.data();

  return statusChange(before, after);

});


exports.deleteAuthUser = functions.firestore.document('users/{userID}').onDelete((event) => {

  const data = event.data.previous.data();

  return admin.auth().deleteUser(data.uid)
    .then(()=>{
      return {
        msg: "user deleted",
        user: data
      }
    })
});

exports.createUser = functions.https.onCall((user, context) => {

  let db = getDB();
  const createAuthUser = () =>{

    return admin.auth().createUser({
      email: user.email,
      emailVerified: false,
      displayName: user.firstName + " " + user.lastName,
      disabled: false
    }).then(u=>u);
  };
  const err = (e)=> {
    throw new functions.https.HttpsError(e.code, "could not create a new user", e);
  }

  return createAuthUser().catch(err);

});


// export GCLOUD_PROJECT = config.projectId;
