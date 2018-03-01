import FBUtil from "../FBUtil";
import _ from "lodash";
import db from "../DBTools"

const firebase = require("firebase");

const User = {
  uid: "0",
  name:"Test User",
  email:"test@example.com"
};


const ChallengeStatus = Object.freeze({
  DRAFT: 1,
  REVIEW: 2,
  PUBLISHED: 3,
  DELETE: 4
});


const dayInMillis = 1000 * 60 * 60 * 24;
const Challenge = {
  id:"",
  title:"",
  tags:"",
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
  text:"",
  video:"",
  audio:"",
  img:"",
  ratings: {},
  avgRatin: 0,
  created: new Date(),
  modified: new Date()
};


const ChallengeDB = {
  cacheDate: null,
  loaded: false,
  cache: {},

  slug(title) {
    return title.toLowerCase()
        .replace(/[^\w\.\- ]+/g,'')
        .trim()
        .replace(/ +/g,'-')
        .replace(/-+/g,'-');
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

  getActive() {
    return new Promise((resolve, reject)=>{
      ChallengeDB.findByStatus(ChallengeStatus.PUBLISHED)
        .then((challenges)=>{
          const now = new Date();
          let active = _.filter(challenges, c=> c.start < now && c.end > now && c.status == ChallengeStatus.PUBLISHED);
          if(active.length == 0)
            reject();
          else
            resolve(_.last(active));
        });
    });
  },

  findByStatus(status) {

    return new Promise((resolve, reject)=>{

      ChallengeDB.findAll().then((challenges)=>{

        challenges = _.filter(challenges, c=>c.status == status);
        challenges = _.sortBy(challenges,c=>c.start);
        resolve(challenges);
      });      
    });
  },

  getStage(c) {
    const now = new Date();
    if(now < c.start)
      return "future";
    if(now > c.end)
      return "archive";
    if(now < c.responseDue)
      return "active"
    if(now < c.ratingDue)
      return "rating";

    return "review";
  },

  findAll() {
    let db = FBUtil.connect();
    let challenges = [];
    let ids = [];
    
    if(ChallengeDB.isCacheLoaded()) {
      challenges = _.values(ChallengeDB.cache);
      // console.log("challenges from cache");
    }

    return new Promise(
      (resolve, reject)=>{
        // console.log("challenges from DB");
        if(challenges.length > 0)
        {
          resolve(challenges);
          return;
        }
        db.collection("challenges").get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let c = {id: doc.id};
            c = _.merge(c, doc.data());
            c.stage = ChallengeDB.getStage(c);

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
          challenge.stage = ChallengeDB.getStage(challenge);
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
            challenge.stage = ChallengeDB.getStage(challenge);
            challenge.id = id;
            if(challenge) //don't cache nulls
              ChallengeDB.cache[id] = challenge;
            resolve(challenge);

          });
      });

  },

  save(c){

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

  calcAvgRating(r) {
    if(!r.ratings || !_.keys(r).length) {
      console.log("no ratings");
      return 0;
    }
    const sum = _.reduce(r.ratings, (sum,i)=>sum+i );
    const size = _.keys(r.ratings).length;
    return sum / size;
  },


  assignRatings(c) {
    const sampleSize = 3;
    const sliceWrap = (t, start, n)=>{
      let slice = _.slice(t,start, start + n);
      let more = n - _.size(slice);
      return  _.concat(slice, _.slice(t, 0, more));
    }

    const assign = (responses)=> {
      let assignments = {};
      const randResponses = _.shuffle(responses);
      _.forEach(randResponses, (r, i)=>{
        let toRate = sliceWrap(randResponses,i+1, sampleSize);
        const t = _.map(toRate, r=>r.id);
        let myAssignments = [];
        _.forEach(t,(a)=>{
          // console.log(a)
          myAssignments.push(a);
        });
        
        assignments[r.user.uid] = myAssignments;
      });

      return assignments;
    };
    
    return new Promise(async (resolve, reject)=>{
      let responses = [];
      await ChallengeDB.getResponses(c.id).then((t)=>{responses = t;});
      const t = assign(responses);

      c.assignments = t;

      let db = FBUtil.connect();
      let ref = db.collection("challenges").doc(c.id);
      await ref.update({assignments: t});

      ChallengeDB.cache[c.id] = c;
      resolve(c);

    });

  },

  getResponses(challengeId) {
    let db = FBUtil.connect();
    let responses = [];
    
    return new Promise(
      (resolve, reject)=>{

        let db = FBUtil.connect();
        db.collection(`challenges/${challengeId}/responses`).get()
          .then((results)=>{
              results.forEach((doc)=>{
                let r = {id: doc.id, ratings: {}};
                r = _.merge(r, doc.data());
                r.avgRating = ChallengeDB.calcAvgRating(r);
                responses.push(r);
              });

          resolve(responses);
        });
    });
  },

  getResponse(challengeId, uuid) {
    return db.get(`challenges/${challengeId}/responses`, uuid);
  },

  addResponse(challengeId, response) {
    if(!response.created)
      response.created = new Date();
    response.created = ChallengeDB.parseDateControlToUTC(response.created);
    response.modified = ChallengeDB.parseDateControlToUTC(new Date());
    
    let db = FBUtil.connect();
    let ref = db.collection("challenges").doc(challengeId).collection("responses").doc(response.user.uid);
    return new Promise((resolve, reject)=>{
      ref.set(response).then(()=>{
        response.id = ref.id;
        let c = ChallengeDB.get(challengeId).then(()=>{
          ChallengeDB.cache[c.id] = c;  
        });
        response.avgRating = ChallengeDB.calcAvgRating(response);

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