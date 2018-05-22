import FBUtil from "./FBUtil";
import _ from "lodash";

/**
 * uuid author broofa
 * https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/2117523#2117523
 */
 /*eslint-disable */
const uuid = ()=>{
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}
/*eslint-enable */

const db = {
  async get(path, id) {
    let db = await FBUtil.connect();
    let p = new Promise((resolve, reject)=>{
        db.collection(path).doc(id).get()
          .then( (doc)=>{            
            if(doc.exists) {
              let record = doc.data();
              record.id = id;
              resolve(this.prep(record));
            }
            else
              reject();
          });
        });

    return p;
  },

  prep(obj) {
    const keys = _.keys(obj);
    // console.log("keys", keys);
    let o2 = {};
    const tsToDate = (k)=> {
      // console.log("key", k);
      const v = obj[k];
      // console.log("v", v);
      if(v && v.toDate) {
        o2[k] = v.toDate();
      }
      else
        o2[k] = v
    }
    _.each(keys, tsToDate);
    return o2;
  },

  findAll(path) {
    return new Promise(
      async (resolve, reject)=>{
        let db = await FBUtil.connect();
        let t = [];
        db.collection(path).get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let record = doc.data();
            record.id = doc.id;
            t.push(this.prep(record));
          });
          resolve(t);
        });
    });
  },

  saveAll(path, t, id) {

    const promiseToSave = async (resolve, reject) => {
      // identify function or obj.id
      if(!id)
        id = (obj)=>{return obj.id};

      const db = await FBUtil.connect();
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


  async save(path, id, data) {
    if(!id)
      return this.add(path, data);

    let db = await FBUtil.connect();
    data.modified = new Date();
    let ref = db.collection(path).doc(id);
    return new Promise((resolve, reject)=>{
      ref.set(data).then(()=>{
        resolve(data);
      });
    });
  },


  async update(path, id, data) {
    let db = await FBUtil.connect();
    data.modified = new Date();
    let ref = db.collection(path).doc(id);
    return new Promise((resolve, reject)=>{
      ref.update(data).then(()=>{
        resolve(data);
      });
    });
  },

  async add(path, data) {
    let db = await FBUtil.connect();
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

  async delete(path, id) {
    let db = await FBUtil.connect();
    console.log(path);
    console.log(id);
    let ref = db.collection(path).doc(id);

    return new Promise((resolve, reject)=>{ref.delete().then(resolve);});
  }
};

export default db;
export {uuid};
