const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);




function rp() {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz _-!@$%^&*()[]{}';";
  chars = _.split(chars, "");
  const passLen = 16;

  let p = "";
  for(let i=0;i<passLen;i++)
    p += _.sample(chars);

  return p;

}

// admin.auth().createUser({
//   uid: "some-uid",
//   email: "user@example.com",
//   phoneNumber: "+11234567890"
// })
//   .then(function(userRecord) {
//     // See the UserRecord reference doc for the contents of userRecord.
//     console.log("Successfully created new user:", userRecord.uid);
//   })
//   .catch(function(error) {
//     console.log("Error creating new user:", error);
//   });



exports.createUser = functions.firestore
  .document('users/{userId}')
  .onCreate(event => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    const user = event.data.data();

    firebase.auth().createUserWithEmailAndPassword(u.email, rp());

    // access a particular field as you would any JS property
    var name = newValue.name;

    // perform desired operations ...
});
