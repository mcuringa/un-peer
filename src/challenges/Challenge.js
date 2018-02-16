import FBUtil from "../FBUtil";
import _ from "lodash";
const firebase = require("firebase");


const User = {
  first:"Test",
  last:"User",
  email:"test@example.com"
};


const ChallengeStatus = Object.freeze({
  DRAFT: 1,
  REVIEW: 2,
  PUBLISHED: 3,
  ARCHIVED: 4
});


const dayInMillis = 1000 * 60 * 60 * 24;
const Challenge = {
  id:"",
  title:"",
  prompt:"",
  status: ChallengeStatus.DRAFT,
  start: new Date(),
  responseDue: new Date(_.now() + dayInMillis * 3),
  ratingDue: new Date(_.now() + dayInMillis * 5),
  end: new Date(_.now() + dayInMillis * 7),
  created: new Date(),
  modified: new Date()
};

const Response = {
  id:"",
  text:"",
  video:"",
  audio:"",
  img:"",
  created: new Date(),
  modified: new Date()
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

  isCacheStale() {
    if(!ChallengeDB.cacheDate)
      return true;

    const cacheTimeout = 1000 * 60 * 5; //5 min 
    const lastUpdate = ChallengeDB.cacheDate.getTime();
    const now = _.now();
    const delta = now - lastUpdate;

    return delta > cacheTimeout;
  },

  isCacheLoaded() {
    // return !_.isEmpty(ChallengeDB.cache);
    return !_.isEmpty(ChallengeDB.cache) && !ChallengeDB.isCacheStale();
  },

  purgeCache(fresh) {
    const keys = _.keys(ChallengeDB.cache);
    const del = _.filter(keys,(k)=>{return !_.includes(fresh, k)});
    _.each(del, (k)=>{_.remove(ChallengeDB.cache,k);});
  },

  findAll() {
    let db = FBUtil.connect();
    let challenges = [];
    let ids = [];
    
    if(ChallengeDB.isCacheLoaded()) {
      challenges = _.values(ChallengeDB.cache);
      // challenges = _.sort(challenges,(c)=>);
      console.log("challenges from cache");
    }

    return new Promise(
      (resolve, reject)=>{
        console.log("challenges from DB");
        if(challenges.length > 0)
        {
          resolve(challenges);
          return;
        }
        db.collection("challenges").get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let c = {id: doc.id};
            c = _.merge(c, doc.data());

            ChallengeDB.cache[c.id] = c;
            challenges.push(c);
            ids.push(c.id);
          });
          ChallengeDB.cacheDate = new Date();
          resolve(challenges);
          // purge the cache later, no need to make caller wait
          ChallengeDB.purgeCache(ids);
        });
    });
  },

  get(id) {
    
    let challenge = ChallengeDB.cache[id];
    if(challenge)
    {
    return new Promise(
      (resolve, reject)=>{
        resolve(challenge);
      });

    }
    challenge = {};

    let db = FBUtil.connect();
    return new Promise(
      (resolve, reject)=>{
        db.collection("challenges").doc(id)
          .get()
          .then( (doc)=>{
            challenge = doc.data();
            challenge.id = id;
            if(challenge) //don't cache nulls
              ChallengeDB.cache[id] = challenge;
            resolve(challenge);

          });
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
    c.modified = ChallengeDB.parseDateControlToUTC(new Date());
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

  addResponse(challengeId, response) {
    response.created = ChallengeDB.parseDateControlToUTC(response.created);
    response.modified = ChallengeDB.parseDateControlToUTC(new Date());
    
    let db = FBUtil.connect();
    let ref = db.collection("challenges").doc(challengeId).collection("responses");
    console.log("adding response");
    return new Promise((resolve, reject)=>{
      ref.add(response).then(()=>{
        response.id = ref.id;
        let c = ChallengeDB.get(challengeId).then(()=>{
          ChallengeDB.cache[c.id] = c;  
        });

        resolve(response);
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
        console.log("checking" + count);
        db.collection("challenges").doc(id).get().then((ref)=> {
          if(!ref.exists) {
            resolve(id);
          }
          else {
            count++;
            const x = incId(id,count);
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
        ChallengeDB.set(c).then(()=>{resolve(c)});
      });
    });

  },
  delete(id) {
    let db = FBUtil.connect();
    db.collection("challenges").doc(id).delete();
  }

};

export {User,
 Challenge,
 Response,
 ChallengeDB,
 ChallengeStatus
};