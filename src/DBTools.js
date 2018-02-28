import FBUtil from "./FBUtil";
import _ from "lodash";
const firebase = require("firebase");

const db = {
  get(path, id) {

    let db = FBUtil.connect();
    let p = new Promise((resolve, reject)=>{
        db.collection(path).doc(id).get()
          .then( (doc)=>{
            if(doc.exists)
              resolve(doc.data());
            else
              reject();
          });
        });

    return p;
  },

  findAll(path) {
    return new Promise(
      (resolve, reject)=>{
        let db = FBUtil.connect();
        let t = [];
        db.collection(path).get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let record = {id: doc.id};
            record = _.merge(record, doc.data());
            t.push(record);
          });
          resolve(t);
        });
    });
  },


  save(path, id, data) {
    let db = FBUtil.connect();
    data.modified = new Date();
    let ref = db.collection(path).doc(id);
    return new Promise((resolve, reject)=>{
      ref.set(data).then(()=>{
        resolve(ref.id);
      });
    });
  },


  update(path, id, data) {
    let db = FBUtil.connect();
    data.modified = new Date();
    let ref = db.collection(path).doc(id);
    return new Promise((resolve, reject)=>{
      ref.update(data).then(()=>{
        resolve(ref.data());
      });
    });
  },

  add(path, data) {
    let db = FBUtil.connect();
    data.created = new Date();
    data.modified = new Date();
    let ref = db.collection(path).doc();
    return new Promise((resolve, reject)=>{
      ref.add(data).then(()=>{
        let obj = {id: ref.id};
        obj = _.merge(obj, ref.data());
        resolve(obj);
      });
    });
  },



};

export default db;