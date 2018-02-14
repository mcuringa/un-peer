import FBUtil from "../FBUtil";
import _ from "lodash";
const firebase = require("firebase");


const User = {
  first:"Test",
  last:"User",
  email:"test@example.com"
};

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

const ChallengeStatus = {
  DRAFT: 1,
  REVIEW: 2,
  PUBLISHED: 3,
  ARCHIVED: 4
}


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

  save(c){
    console.log("save called");

    if(_.isNil(c.id) || _.isEmpty(c.id))
      return ChallengeDB.add(c);
    else
      return ChallengeDB.set(c);

  },
  
  parseDateControlToUTC(d) {
   if(d.getTime)
      return d;
    const t = _.split(d, "-");
    return new Date(Date.UTC(t[0], t[1]-1, t[2], new Date().getTimezoneOffset()/60, 0, 0));
  },

  set(c) {
    console.log("set called");
    c.modified = firebase.firestore.FieldValue.serverTimestamp();
    c.start = ChallengeDB.parseDateControlToUTC(c.start);
    c.end = ChallengeDB.parseDateControlToUTC(c.end);
    c.responseDue = ChallengeDB.parseDateControlToUTC(c.responseDue);
    c.ratingDue = ChallengeDB.parseDateControlToUTC(c.ratingDue);

    let db = FBUtil.connect();
    let ref = db.collection("challenges").doc(c.id);
    

    return new Promise((resolve, reject) => {
      ref.set(c).then(()=>{
        c.id = ref.id;
        ChallengeDB.cache[c.id] = c;

        resolve(c);
      });
    });
  },

  uniqueId: (testId)=> {
    let db = FBUtil.connect();
    let count = 0;
    const incId = (id, count)=> {
      return `${testId}_${count}`;
    };

    return new Promise((resolve, reject) => {
      const checkExists = (id)=> {
        db.collection("challenges").doc(id).get().then((ref)=> {
          if(!ref.exists) {
            resolve(id);
          }
          else {
            count++;
            const x = incId(id,count);
            console.log("incId: " + x);
            checkExists(x);
          }
        });
      }


      checkExists(testId);
    });
  },

  add(c) {
    c.id = ChallengeDB.slug(c.title);

    return new Promise((resolve, reject)=>{
      ChallengeDB.uniqueId(c.id).then((id)=> {
        c.id = id;
        console.log("found a unique ID to add..." + c.id);
        c.created = new Date();
        // c.created = firebase.firestore.FieldValue.serverTimestamp();
        ChallengeDB.set(c).then(resolve);
      });
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