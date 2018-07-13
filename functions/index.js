const functions = require('firebase-functions');
let admin = null;
let db = null;

if(!admin){
  admin = require('firebase-admin');
  admin.initializeApp({
      credential: admin.credential.applicationDefault()
  });
}

const Status = Object.freeze({
  DRAFT: 1,
  REVIEW: 2,
  PUBLISHED: 3,
  DELETE: 4,
  REJECT: 5
});

const POLLING_FREQUENCY = 15;
const DOMAIN = "https://un-peer-challenges.firebaseapp.com"
const ALERT_ICON = DOMAIN + "/img/icon.png";

const getDB = ()=> {
  return db = db || admin.firestore();
}


const logErr = (e)=>{ console.log(e); }

const sendUserNotification = (user, msg)=> {
  // console.log("sending", msg);
  // console.log("user", user);
  // console.log("token", user.pushToken);
  if(user.pushToken == null) { // eslint-disable-line
    // console.log("skipping user", user.email, " token is undefined.");
    return false;
  }
  msg.token = user.pushToken;
  // msg.notification.body = `${msg.notification.body} (${user.uid})`;
  const logNotError = (e)=> {
    let s = `Error sending message to user ${user.email} \n: error code: ${e.code} \nmsg: ${e.message}`;
    console.log(s);
  }
  return admin.messaging().send(msg).then((response) => { return response;}).catch(logNotError);
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
    "icon": ALERT_ICON,
  }
  before.status = parseInt(before.status);
  after.status = parseInt(after.status);

  if(before.status === REVIEW && after.status === REJECT) {
    const notification = {
        "title": "Challenge Rejected",
        "body": `The challenge you submitted was not chosen as a challenge of the week.`
    }
    data.clickAction = DOMAIN + "/my/challenges";
    const msg = { "notification": notification, "data": data}
    const send = (u)=> {
      let user = u.data();
      user.id = u.id;
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
    data.clickAction = `https://un-peer-challenges.firebaseapp.com/challenge/${after.id}`;

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
  console.log("saving notification message with id:", msg.data.id);

  let db = getDB();
  const path = `/users/${user.uid}/messages`;
  let ref;
  if(msg.data.id) {
    ref = db.collection(path).doc(msg.data.id);
  }
  else
    ref = db.collection(path).doc();
  const note = {
    title: msg.notification.title,
    body: msg.notification.body,
    read: false,
    clickAction: msg.data.clickAction || "",
    sent: msg.data.sent || new Date(),
    data: msg.data,
    expires: msg.data.expires || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }

  if(batch)
    return batch.set(ref, note);
  
  return ref.set(note);
}


const notifyAll = (snapshot, msg)=> {
  console.log("notifying all from a query", snapshot);
  let db = getDB();
  const batch = db.batch();

  const notify = (doc) => {
    let user = doc.data();
    console.log("notifying a user", user);
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
  return db.collection("/users").where("admin", "==", true).get();
}

const notifyAdminPending = (challenge)=> {
  console.log("notifying admins of a new pending challenge", challenge);

  let data = {
    "challengeId": challenge.id,
    "challengeTitle": challenge.title,
    "sent": new Date().toISOString(),
    "icon": ALERT_ICON,
    "clickAction": `${DOMAIN}/challenge/${challenge.id}/edit`
  }
  const notification = {
      "title": "Challenge Submitted for Review",
      "body": `There is a new pending challenge.`
  }

  const msg = { "notification": notification, "data": data}
  const notify = (snapshot)=>{ notifyAll(snapshot, msg) };
  

  return findAdmins().then(notify).catch(logErr);
}


const makeNotification = (title, body, clickAction, id)=> {
    let data = {
      "id": id || null,
      "sent": new Date().toISOString(),
      "icon": ALERT_ICON,
      "clickAction": clickAction
    }
    let notification = {
      "title": title,
      "body": body
    }

    return { "notification": notification, "data": data}

}

exports.challengeNotifications = functions.https.onRequest((req, res) => {
  console.log("calling challengeNotifications");


  let db = getDB();
  const rangeStart = new Date();
  const rangeEnd = new Date(rangeStart.getTime() + 1000 * 60 * POLLING_FREQUENCY);

  const getActiveChallenges = ()=> {
    console.log("getting active challenges ending after", rangeStart);
    
    return db.collection("challenges")
    .where("status", "==", Status.PUBLISHED)
    .where("end", ">", rangeStart)
    .get();  
  }

  const sendStart = (c)=> {
    // console.log("active challenge found for alerts", c);
    // console.log("rangeStart", rangeStart);
    // console.log("start", c.start);
    if(c.start < rangeStart || c.start > rangeEnd)
      return false;

    console.log("sending start message");
    const title = "New Challenge";
    const body = c.title;
    const click = `${DOMAIN}/challenge/${c.id}`;
    const id = `START_${c.id}`;
    const msg = makeNotification(title, body, click, id);
    const notify = (snapshot)=>{ notifyAll(snapshot, msg) };

    db.collection("/users").get().then(notify).catch(logErr);
    return true;

  }


  const sendResponseDue = (c)=> {
    console.log("calling sendResponseDue");
    const dayBefore = new Date(c.responseDue.getTime() - 1000 * 60 * 60 * 24);
    const timesRunningOut = new Date(c.responseDue.getTime() - 1000 * 60 * 60 * 3);
    const timing = "\n" 
    + "rangeStart: " + rangeStart + "\n"
    + "Start: " + c.start + "\n"
    + "Respones: " + c.responseDue + "\n"
    + "24 hours before response: " + dayBefore + "\n"
    + "3 hours before response: " + timesRunningOut + "\n"
    + "Ratings: " + c.ratingsDue + "\n"
    + "End: " + c.end + "\n"
    + "Range End" + rangeEnd + "\n";

    // console.log(timing);

    let id;
    let body;
    if(dayBefore >= rangeStart && dayBefore <= rangeEnd) {
      id = `RESPOND_${c.id}`;
      body = "Response due tomorrow."
    }
    else if(timesRunningOut >= rangeStart && timesRunningOut <= rangeEnd) {
      id = `RESPOND2_${c.id}`;
      body = "3 hours remaining to respond."
    }
    else {
      console.log("no upcoming response in time range");
      return false;
    }

    console.log("sending response message");
    const title = c.title;
    const click = `${DOMAIN}/challenge/${c.id}/respond`;
    const msg = makeNotification(title, body, click, id);
    
    const notify = (snapshot)=>{ notifyAll(snapshot, msg) };

    const findUnResponded = ()=> {
      
      const findResponses = ()=> {

        const makeMap = (responses)=> { 
          let responseMap = {};
          const mapResponse = (doc)=> { responseMap[doc.id] = true; }
          responses.forEach(mapResponse); 
          return new Promise((resolve, reject)=>{
            resolve(responses);
          });
        }
        
        const responseP = (resolve, reject)=> {
          db.collection(`/challenges/${c.id}/responses`).get(makeMap).then(resolve).catch(logErr);
        }

        return new Promise(responseP);
      }

      const findUsers = (responses)=> {
        
        const filter = (allUsers)=> {
          let noResponse = [];

          const f = (doc)=> {
            if(!responses[doc.id])
              noResponse.push(doc);
          }

          allUsers.forEach(f);
          return new Promise((resolve, reject)=> { resolve(noResponse); });
        }

        const userP = (resolve, reject)=> {
          db.collection("/users").get().then(filter).then(resolve).catch(logErr);
        };

        return new Promise(userP);
      }

      return new Promise((resolve, reject)=> {
        findResponses().then(findUsers).then(resolve).catch(logErr);
      });

    }

    return findUnResponded().then(notify);
  }


  const sendRatingDue = (c)=> {
    console.log("calling sendRatingDue");
    const timesRunningOut = new Date(c.ratingDue.getTime() - 1000 * 60 * 60 * 3);

    let id;
    let body;
    if(c.ratingDue >= rangeStart && c.ratingDue <= rangeEnd) {
      id = `RATING_${c.id}`;
      body = "Rating assignments now available."
    }
    else if(timesRunningOut >= rangeStart && timesRunningOut <= rangeEnd) {
      id = `RATING2_${c.id}`;
      body = "3 hours remaining to finalize ratings."
    }
    else {
      console.log("no upcoming rating in time range");
      return false;
    }

    console.log("sending rating message");
    const title = c.title;
    const click = `${DOMAIN}/challenge/${c.id}/rate`;
    const msg = makeNotification(title, body, click, id);
    
    const notify = (snapshot)=>{ notifyAll(snapshot, msg) };

    const findParticipants = ()=> {
      
      const findAssignments = ()=> {

        const makeMap = (responses)=> { 
          let responseMap = {};
          const mapResponse = (doc)=> { responseMap[doc.id] = true; }
          responses.forEach(mapResponse); 
          return new Promise((resolve, reject)=>{
            resolve(responses);
          });
        }
        
        const assignmentsPromise = (resolve, reject)=> {
          db.collection(`/challenges/${c.id}/assignments`).get(makeMap).then(resolve).catch(logErr);
        }

        return new Promise(assignmentsPromise);
      }

      const findUsers = (usersWithAssignments)=> {
        
        const filter = (allUsers)=> {
          let participants = [];

          const f = (doc)=> {
            if(!usersWithAssignments[doc.id])
              participants.push(doc);
          }

          allUsers.forEach(f);
          return new Promise((resolve, reject)=> { resolve(participants); });
        }

        const userP = (resolve, reject)=> {
          db.collection("/users").get().then(filter).then(resolve).catch(logErr);
        };

        return new Promise(userP);
      }

      return new Promise((resolve, reject)=> {
        findAssignments().then(findUsers).then(resolve).catch(logErr);
      });

    }

    return findUnResponded().then(notify);
  }


  const sendChoiceNotification = (c)=> {
    console.log("checking choice notifications");
    if(c.responseDue < rangeStart || c.responseDue > rangeEnd)
      return false;

    console.log("sending owner and instructor messages");
    const title = c.title;
    const body = "Responses are in. Make your choice.";
    const owner = `REVIEW_${c.id}`;
    
    const click = `${DOMAIN}/challenge/${c.id}/review`;


    const timeLeft = c.ratingDue.getTime() - new Date().getTime();
    const hour = 1000 * 60 * 60;
    const day = hour * 24;
    const hoursLeft = Math.floor(timeLeft / hour);
    const daysLeft = Math.floor(timeLeft / day);
    let dueMsg = "";
    if(hoursLeft >24) {
      const s = (daysLeft !== 1)?"s": "";
      dueMsg = `${daysLeft} day${s}`;
    }
    else {
      const s = (hoursLeft !== 1)?"s": "";
      dueMsg = `${hoursLeft} hour${s}`;
    }

    const ownerMsg = makeNotification(`[Owner] ${c.title}`, `Responses are ready. Your "owner's choice" selection is due in ${dueMsg}.`, click, `OWNER_${c.id}`);
    const instructorMsg = makeNotification(`[Instructor] ${c.title}`, `Responses are ready. Your wrap-up video and the "expert's choice" selection are due in ${dueMsg}"`, click, `INSTRUCTOR_${c.id}`);

    const sendOwner = (u)=> {
      let user = u.data();
      user.id = u.id;
      saveMsg(user, ownerMsg);
      sendUserNotification(user, ownerMsg);
    }
    const sendInstructor = (u)=> {
      let user = u.data();
      user.id = u.id;
      saveMsg(user, instructorMsg);
      sendUserNotification(user, instructorMsg);
    }
    let db = getDB();
    db.collection("/users").doc(c.owner.uid).get().then(sendOwner).catch(logErr); 
    db.collection("/users").doc(c.professor.uid).get().then(sendInstructor).catch(logErr); 

    return true;

  }


  const sendReview = (c)=> {
    console.log("checking for review notification for ", c);
    if(c.ratingDue < rangeStart || c.ratingDue > rangeEnd)
      return false;

    console.log("sending review message");
    const title = c.title;
    const body = "Results are published.";
    const click = `${DOMAIN}/challenge/${c.id}/review`;
    const id = `REVIEW_${c.id}`;
    const msg = makeNotification(title, body, click, id);
    const notify = (snapshot)=>{ notifyAll(snapshot, msg) };

    db.collection("/users").get().then(notify).catch(logErr);
    return true;

  }

  const sendChallengeNotifications = (doc)=> {
    console.log("sending challenges for", doc.id);
    let challenge = doc.data();
    challenge.id = doc.id;
    sendStart(challenge);
    sendResponseDue(challenge);
    sendRatingDue(challenge);
    sendReview(challenge);
    sendChoiceNotification(challenge);
    return true;
  }


  const iterateChallenges = (snapshot)=> {
    console.log("iterating active challenges for notifications");
    console.log("num challenges:", snapshot.docs);
    snapshot.forEach(sendChallengeNotifications);
  }

  getActiveChallenges().then(iterateChallenges).catch(logErr);


  res.status(200).send("OK Notify New Challenge");

});



exports.challengeUpdate = functions.firestore.document("challenges/{id}").onUpdate((change, b, c, d)=> {

  const after = change.after.data();
  const before = change.before.data();
  return statusChange(before, after);

});



exports.deleteUser = functions.https.onCall((user, context) => {

  let db = getDB();
  let ref = db.collection("/users").doc(user.uid);

  let delAuth = admin.auth().deleteUser(user.uid);
  let delDB = ref.delete();
  Promise.all([delAuth, delDB]).then(()=>{
    console.log("deleted user", user.uid);
    return {
      "msg": "User deleted",
      "uid": user.uid
    }
  }).catch((e)=>{
    console.log("failed to delete user", user.uid);
    console.log(e);
  });

});



exports.deleteAuthUser = functions.firestore.document('users/{userID}').onDelete((event) => {

  const data = event.data.previous.data();

  return admin.auth().deleteUser(data.uid)
    .then(()=>{
      return {
        msg: "user deleted",
        user: data
      }
    });
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

