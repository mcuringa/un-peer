const challenges = [
  { 
    "thumbnail": "thumb.png",
    "start": "2018-01-29T00:00:11.891Z",
    "end": "2018-02-04T23:59:11.891Z",
    "owner": {
      "email": "mcuringa@adelphi.edu",
      "name": "Matt Curinga"
    },
    "title": "People Management",
    "prompt": "There is a staff in my team who needs to be closely monitored for every work performed in order to avoid any possible mistakes. She will only follow instructions without doing much thinking. She does not think it thru before considering different factors. She is also not organized as very constant the document are not filed properly in the network system."
  },
  {
    "thumbnail": "thumb.png",
    "start": "2018-02-05T00:00:11.891Z",
    "end": "2018-02-11T23:59:11.891Z",
    "owner": {
      "email": "mcuringa@adelphi.edu",
      "name": "Matt Curinga"
    },    
    "title": "Strategic Management",
    "prompt": "More often than not, we develop mandatory policy documents for the country team well in advance. However, sometimes a new policy on such documents and procedures is being adopted and promulgated right in the middle of this process, with an immediate effect, and often warrants some significant modifications be done to the already developed documents. How do we go about such a conflict of direction?  Do we stick to the current procedures or we redo the whole set of documents along with the lines of such a newly adopted policy?"
  },
  {
    "thumbnail": "thumb.png",
    "start": "2018-02-12T00:00:11.891Z",
    "end": "2018-02-19T23:59:11.891Z",
    "owner": {
      "email": "mcuringa@adelphi.edu",
      "name": "Matt Curinga"
    },    
    "title": "Internal Communication",
    "prompt": "These days people no longer talk to each other in person but rather communicate through emails, short message service and various web chat applications. This is not too bad as one can always trace an important conversation through this written record. However, face-to-face staff meetings and individual face-to-face discussions continue to play an important role. What is the best balance between these two ways of internal communication in a team of 20-30 staff?"
  }
];

const firebase = require("firebase");
require("firebase/firestore");

console.log("loading initial challenge data");

// const firebaseConfig = {
//   apiKey: "AIzaSyBvgDJ2EyxDaZervfY7yImDrvXE8R8Vzpo",
//   authDomain: "un-peer-challenges.firebaseapp.com",
//   databaseURL: "https://un-peer-challenges.firebaseio.com",
//   projectId: "un-peer-challenges",
//   storageBucket: "un-peer-challenges.appspot.com",
//   messagingSenderId: "789085021989"
// };
// firebase.initializeApp(firebaseConfig);

// firebase.firestore().enablePersistence()
//   .then(function() {
//       // Initialize Cloud Firestore through firebase
//       let db = firebase.firestore();
//       db.collection("challenges").add(challenges);
//       console.log("added challenges");
//   })
//   .catch(function(err) {
//     console.log(err.code);
//   });