const functions = require('firebase-functions');
let admin = null;
let db = null;

if(!admin){
  admin = require('firebase-admin');
  admin.initializeApp({
      credential: admin.credential.applicationDefault()
  });
}

const getDB = ()=> {
  return db = db || admin.firestore();
}


const logErr = (e)=>{ console.log(e); }

const sendUserNotification = (user, msg)=> {
  console.log("sending", msg);
  console.log("user", user);
  console.log("token", user.pushToken);
  msg.token = user.pushToken;
  return admin.messaging().send(msg).then((response) => { return response;}).catch(logErr);
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

  if(before.status === REVIEW && after.status === REJECT) {
    console.log("reject");
    console.log("notifying uid:", before.owner.uid);
    const notification = {
        "title": "Challenge Rejected",
        "body": `The challenge you submitted was not chosen as a challenge of the week.`
    }
    data.clickAction = "https://un-peer-challenges.firebaseapp.com/my/challenges";
    const msg = { "notification": notification, "data": data}
    const send = (u)=> {
      let user = u.data();
      user.id = u.id;
      console.log("sending to ", user);
      saveMsg(user, msg);
      sendUserNotification(user, msg);
    }
    let db = getDB();
    return db.collection("/users").doc(before.owner.uid).get().then(send).catch(logErr); 
  }

  if(before.status === REVIEW && after.status === PUBLISHED) {
    console.log("accept");
    const notification = {
        "title": "Challenge Accepted",
        "body": `Your challenge was chosen as a challenge of the week.`
    }
    data.clickAction = `https://un-peer-challenges.firebaseapp.com/challenge/${data.challengeId}`;

    const msg = { "notification": notification, "data": data}
    const send = (u)=> {
      let user = u.data();
      user.id = u.id;
      console.log("sending to ", user);
      saveMsg(user, msg);
      sendUserNotification(user, msg);
    }
    let db = getDB();
    return db.collection("/users").doc(before.owner.uid).get().then(send).catch(logErr); 
  }


  if(before.status !== REVIEW && after.status === REVIEW) {
    console.log("new pending");
    return notifyAdminPending(after);
  }

  return "no action";

}

const saveMsg = (user, msg, batch)=> {
  let db = batch || getDB();
  const path = `/users/${user.uid}/messages`
  let ref = db.collection(path).doc();
  const note = {
    title: msg.notification.title,
    body: msg.notification.body,
    link: msg.data.clickAction || "",
    data: data,
    expires: msg.data.expires || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
  return ref.set(note);
}


const notifyAll = (snapshot, msg)=> {
  let db = getDB();
  const batch = db.batch();

  const notify = (doc) => {
    let user = doc.data();
    user.id = doc.id;
    saveMsg(user, msg, batch);
    sendUserNotification(user, msg);
  }

  snapshot.forEach(notify);
  batch.commit().catch(logErr);

  return "notifications sent";
}


const findAdmins = ()=> {
  let db = getDB();
  return db.collection("/users").where("admin", "==", true);
}

const notifyAdminPending = (challenge)=> {

  let data = {
    "challengeId": challenge.id,
    "challengeTitle": challenge.title,
    "sent": new Date().toISOString(),
    "icon": 'https://un-peer-challenges.firebaseapp.com/img/home.png',
    "clickAction": `https://un-peer-challenges.firebaseapp.com/challenge/${challenge.challengeId}`
  }
  const notification = {
      "title": "Challenge Submitted for Review",
      "body": `There is a new pending challenge..`
  }

  const msg = { "notification": notification, "data": data}
  const notify = (snapshot)=>{ notifyAll(snapshot, msg) };
  

  return findAdmins().then(notify).catch(logErr);
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

/**
 * creates a new auth user
 * this function is called when administrators add users directly through the
 * web interface
 */
exports.createUser = functions.https.onCall((user, context) => {

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

exports.createAppUser = functions.auth.user().onCreate((user) => {
  let db = getDB();
  let ref = db.collection("/users").doc(user.uid);
  const splitName = (displayName)=> {
    let name = {};
    let t = displayName.split(" ");
    name.first = t[0] || "";
    name.last = (t.length > 1)?t[1]:"";

    return name;
  }

  let name = splitName(user.displayName);
  let appUser = {
    firstName: name.first,
    lastName: name.last,
    email: user.email,
    uid: user.uid,
    created: new Date(),
    modified: new Date()
  };

  const err = (e)=> {
    throw new functions.https.HttpsError(e.code, "could not create a new application user", e);
  }
  return ref.set(appUser).catch(err);

});

