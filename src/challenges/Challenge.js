import FBUtil from "../FBUtil";

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

  loadChallenge(id, exec) {
    let db = FBUtil.connect();
    let challenge = {};
    let owner = {};
    db.collection("challenges").doc(id)
      .get()
      .then( async (doc)=>{
        challenge.id = id;
        challenge = await doc.data();
        const owner = challenge.owner;
        exec(challenge);
      });
  }
};

export {User};
export {Challenge};
export {ChallengeDB};