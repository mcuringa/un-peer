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
  const err = (e)=>{
    throw new functions.https.HttpsError(e.code, "could not create a new user", e);
    // return e;
  }

  return createAuthUser().catch(err);

});
