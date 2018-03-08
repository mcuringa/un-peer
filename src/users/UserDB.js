import FBUtil from "../FBUtil.js";
import db from "../DBTools.js";
import _ from "lodash";


let UserDB = {



ROLES: {
  STUDENT: 1,
  ADMIN: 2,
  SU: 3
},

NewUser: {
  uid: 0,
  email: "",
  firstName: "",
  lastName: "",
  displayName: "",
  student: true,
  admin: false,
  su: false

},

userKeys: [
  "uid",
  "email",
  "firstName",
  "lastName",
  "displayName",
  "student",
  "admin",
  "su"
],

get(uid) {

  let store = FBUtil.connect();
  let p = new Promise((resolve, reject)=>{
    store.collection("users").doc(uid).get()
      .then( (doc)=>{
        if(doc.exists)
          resolve(doc.data());
        else
          reject();
      });
    });

  return p;

},

addBookmark(uid, response, challenge) {
  
  const rKeys = ["title", "video", "avgRating","text"];
  let bookmark = _.pick(response, rKeys);
  bookmark.challengeId = challenge.id;
  bookmark.challengeTitle = challenge.title;
  bookmark.challengeStart = challenge.start;
  bookmark.created = new Date();

  const path = `/users/${uid}/bookmarks`;
  const id = response.id;

  return new Promise((resolve,reject)=>{
    db.save(path,id,bookmark).then(resolve);
  });
},

create(newUser) {
  const user = newUser;

  return new Promise((resolve,reject)=>{
    let firebase = FBUtil.init();

    const rp = ()=> {
      const chars = _.split("ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz _-!@$%^&*()[]{}';", "");
      let pass = _.fill(new Array(16), false);
      return _.map(pass,e=>_.sample(chars)).join("");
    }

    const sendPass = ()=>{ return firebase.auth().sendPasswordResetEmail(user.email) };
    const save = (u)=>{ 

      console.log("current user after create");
      console.log(firebase.auth().currentUser);

      user.uid = u.uid;

      const defaults = {
        admin: false, 
        su: false, 
        student: true,
        created: new Date(),
        uid: u.uid
      };
      const newUser = _.merge(user, defaults);
      return db.save("/users", u.uid, newUser);
    };

    const currentUser = firebase.auth().currentUser;
    console.log(currentUser.email);

    firebase.auth().createUserWithEmailAndPassword(user.email, rp())
      .then(save)
      .then(sendPass)
      .then(()=>{resolve(user)})
      .catch( (e)=> {
          console.log(e);
          if(reject)
            reject(e);
        });
      

    });
},

save(u) {
  u.modified = new Date();

  let store = FBUtil.connect();
  let ref = store.collection("users").doc(u.uid);

  return new Promise((resolve, reject) => {
    ref.set(u).then(()=>{
      resolve(u);
    });
  });
},

}

export default UserDB;