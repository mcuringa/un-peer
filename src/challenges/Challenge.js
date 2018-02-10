import FBUtil from "../FBUtil";
import _ from "lodash";
const firebase = require("firebase");


const User = {first:"",last:"",email:""};
const Challenge = {
  id:"",
  title:"",
  prompt:"",
  start: "",
  end: "",
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
        ChallengeDB.cache[c.id] = c;
        challenges.push(c);
        ChallengeDB.cacheDate = new Date();
      });

      onload(challenges);
    });
  },

  save: (c)=> {
    console.log("save called");

    if(_.isNil(c.id) || _.isEmpty(c.id))
      ChallengeDB.add(c);
    else
      ChallengeDB.set(c);

  },
  set(c) {
    console.log("set called");
    let db = FBUtil.connect();
    c.modified = firebase.firestore.FieldValue.serverTimestamp();
    db.collection("challenges").doc(c.id).set(c);
  },

  add(c) {
    c.id = ChallengeDB.slug(c.title);
    // console.log("firebase: " + firebase);
    // console.log("firebase.firestore: " + firebase.firestore);
    // console.log("firebase.firestore.FieldValue: " + firebase.firestore.FieldValue);
    c.created = new Date();
    // c.created = firebase.firestore.FieldValue.serverTimestamp();
    ChallengeDB.set(c);
    // let count = 0;
    // const saveNoConflict = (conflict)=> {
    //   console.log("saveNoConflict called");
    //   console.log("conflict": conflict);
    //   if(_.isNull(conflict))
    //     ChallengeDB.set(c);
    //   else {
    //     count++;
    //     c.id = c.id + count;
    //     ChallengeDB.get(c.id, saveNoConflict);
    //   }
    // }

    // ChallengeDB.get(c.id, saveNoConflict);
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
        challenge.id = id;
        challenge = doc.data();
        if(challenge) //don't cache nulls
          ChallengeDB.cache[id] = challenge;
        onload(challenge);

      });
  }
};

export {User};
export {Challenge};
export {ChallengeDB};