import challenges from './challenges.json';
import _ from "lodash";

const ChallengeDB = {

  findAll: ()=> {
    return challenges;
  },

  findById: (id)=> {
    console.log("finding by id: " + id);
    return _.find(challenges,(c)=>{ return c.id == id; });
  }
}

export default ChallengeDB;
