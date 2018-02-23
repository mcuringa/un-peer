import FBUtil from "../FBUtil.js";

let UserDB = {

get(uid) {

  let db = FBUtil.connect();
  let p = new Promise((resolve, reject)=>{
        db.collection("users").doc(uid).get()
          .then( (doc)=>{
            if(doc.exists)
              resolve(doc.data());
            else
              reject();
          });
        });

  return p;

},

save(u) {
  u.modified = new Date();

  let db = FBUtil.connect();
  let ref = db.collection("users").doc(u.uid);

  return new Promise((resolve, reject) => {
    ref.set(u).then(()=>{
      resolve(u);
    });
  });
},

}

export default UserDB;