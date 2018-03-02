const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);





exports.deleteUser = functions.firestore
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
