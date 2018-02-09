import FBUtil from "../FBUtil";
import _ from "lodash";


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
  loaded: false,
  cache: {},

  findAll(onload) {
    let db = FBUtil.connect();
    let challenges = [];
    db.collection("challenges").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        let c = {id: doc.id};
        c = _.merge(c, doc.data());
        ChallengeDB.cache[c.id] = c;
        challenges.push(c);
      });

      onload(challenges);
    });
  },


  loadChallenge(id, onload) {
    
    let challenge = ChallengeDB.cache[id];
    if(challenge)
    {
      console.log("challenge in cache");
      console.log(challenge);
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
        ChallengeDB.cache[id] = challenge;
        onload(challenge);

      });
  }
};

export {User};
export {Challenge};
export {ChallengeDB};