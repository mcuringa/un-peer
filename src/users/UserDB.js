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