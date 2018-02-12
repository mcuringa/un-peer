import FBUtil from "../FBUtil";
import _ from "lodash";
const firebase = require("firebase");


const User = {first:"",last:"",email:""};
const day = 1000 * 60 * 60 * 24;
const Challenge = {
  id:"",
  title:"",
  prompt:"",
  start: new Date(),
  responseDue: new Date(_.now() + day * 3),
  ratingDue: new Date(_.now() + day * 5),
  end: new Date(_.now() + day * 7),
  created: "",
  modified: ""
};

const ChallengeDB = {
  cacheDate: null,
  loaded: false,
  cache: {},

  slug(title) {
    return title.toLowerCase()
        .replace(/[^\w ]+/g,'')
        .trim()
        .replace(/ +/g,'-');
  },

  findAll(onload) {
    let db = FBUtil.connect();
    let challenges = [];
    
    db.collection("challenges").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        let c = {id: doc.id};
        c = _.merge(c, doc.data());

        c.start = new Date(c.start);
        c.end = new Date(c.end);
        c.responseDue = new Date(c.responseDue);
        c.ratingDue = new Date(c.ratingDue);

        ChallengeDB.cache[c.id] = c;
        challenges.push(c);
        ChallengeDB.cacheDate = new Date();
      });    
      onload(challenges);
    });
    
  },
  get(id, onload) {
    
    let challenge = ChallengeDB.cache[id];
    if(challenge)
    {
      onload(challenge);
      return;
    }
    challenge = {};

    let db = FBUtil.connect();
    db.collection("challenges").doc(id)
      .get()
      .then( async (doc)=>{
        challenge = doc.data();
        challenge.id = id;
        if(challenge) //don't cache nulls
          ChallengeDB.cache[id] = challenge;
        onload(challenge);

      });
  },

  save: (c)=> {
    console.log("save called");

    if(_.isNil(c.id) || _.isEmpty(c.id))
      return ChallengeDB.add(c);
    else
      return ChallengeDB.set(c);

  },

  set(c) {
    console.log("set called");

    let db = FBUtil.connect();
    c.modified = firebase.firestore.FieldValue.serverTimestamp();
    c.start = new Date(c.start).getTime();
    c.end = new Date(c.end).getTime();
    c.responseDue = new Date(c.responseDue).getTime();
    c.ratingDue = new Date(c.ratingDue).getTime();


    return db.collection("challenges").doc(c.id).set(c);
  },

  uniqueId: async (id)=> {
    let db = FBUtil.connect();
    let count = 0;
    let doc = await db.collection("challenges").doc(id).get();
    let exists = await doc.exists;

    while(exists) {
      count++;
      doc = await db.collection("challenges").doc(`${id}_${count}`).get();
      exists = await doc.exists;
    }
    if(count > 0)
      id = `${id}_${count}`;
    return id;
  },

  add(c) {
    c.id = ChallengeDB.slug(c.title);
    ChallengeDB.uniqueId(c.id).then((id)=> {
      c.id = id;
      console.log("saving..." + c.id);
      c.created = new Date();
      // c.created = firebase.firestore.FieldValue.serverTimestamp();
      return ChallengeDB.set(c);
    });

  },
  delete(id) {
    let db = FBUtil.connect();
    db.collection("challenges").doc(id).delete();
  }

};

export {User};
export {Challenge};
export {ChallengeDB};