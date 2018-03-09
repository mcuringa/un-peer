import FBUtil from "./FBUtil";
import _ from "lodash";

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
            let record = doc.data();
            record.id = doc.id;
            t.push(record);
          });
          resolve(t);
        });
    });
  },

  saveAll(path, t, id) {

    const promiseToSave = (resolve, reject) => {
      // identify function or obj.id
      if(!id)
        id = (obj)=>{return obj.id};

      const db = FBUtil.connect();
      const batch = db.batch();

      const err = (e)=>{
        console.log(e);
        reject(e);
      }

      const save = (o)=> {
        let ref = db.collection(path).doc(id(o));
        batch.set(ref, o);
      }

      _.each(t, save);


      batch.commit().then(()=>{
        resolve(t)
      }).catch(err);

    }

    return new Promise(promiseToSave);

  },


  save(path, id, data) {
    if(!id)
      return this.add(path, data);

    let db = FBUtil.connect();
    data.modified = new Date();
    let ref = db.collection(path).doc(id);
    return new Promise((resolve, reject)=>{
      ref.set(data).then(()=>{
        resolve(data);
      });
    });
  },


  update(path, id, data) {
    return this.save(path, id, data);
  },

  add(path, data) {
    let db = FBUtil.connect();
    data.created = new Date();
    data.modified = new Date();
    let ref = db.collection(path).doc();
    return new Promise((resolve, reject)=>{
      ref.set(data).then(()=>{
        let obj = {id: ref.id};
        obj = _.merge(obj, data);
        resolve(obj);
      });
    });
  },

  delete(path, id) {
    let db = FBUtil.connect();
    console.log(path);
    console.log(id);
    let ref = db.collection(path).doc(id);

    return new Promise((resolve, reject)=>{ref.delete().then(resolve);});
  }




};

export default db;
