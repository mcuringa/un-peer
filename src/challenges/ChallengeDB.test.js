import FBUtil from "../FBUtil";
import _ from "lodash";
import {ChallengeDB, Challenge, Response, User, ChallengeStatus} from "./Challenge";

const longTimeout = 1000 * 20;


it("should load all of the Challenges from firebase", ()=>{
    
  // make sure it's not coming from cache
  ChallengeDB.cache = {};

  return ChallengeDB.findAll().then(
    (t)=> {
      const len = t.length;
      expect(len).toBeGreaterThan(0);
      const title = t[0].title;
      expect(title).toEqual(expect.anything());
    }
  );
});

it.skip("assigns responses to users for a challenge", async ()=>{
  // const cid = "what-about-the-careless-staff";
  const cid = "foo";
  ChallengeDB.cache = {};
  let challenge;
  await ChallengeDB.get(cid).then((c)=>{challenge = c;});

  return ChallengeDB.assignRatings(challenge).then((c)=>{
    console.log(c.assignments);
  });
}, longTimeout);


it("should get the user's response for a challenge", ()=>{

  const cid = "what-about-the-careless-staff";
  const uid = "qeNXoRsAlsVniTfGy1wHKMHpLIV2";
  return ChallengeDB.getResponse(cid,uid).then(
    (r)=> {
      expect(r).toBeDefined();
    },()=>{console.log("no response found for this challenge/user");}
  );
});



it("should return the active challenge", ()=>{
    
  // make sure it's not coming from cache
  ChallengeDB.cache = {};

  return ChallengeDB.getActive().then(
    (c)=> {
      expect(c).toBeDefined();
    }
  );
});


it("should find all challenges with Published status", ()=>{
    
  // make sure it's not coming from cache
  ChallengeDB.cache = {};

  return ChallengeDB.findByStatus(ChallengeStatus.DRAFT).then(
    (t)=> {
      const len = t.length;
      expect(len).toBeGreaterThan(0);
      expect(_.every(t,c=>c.status==ChallengeStatus.DRAFT)).toBe(true);
    }
  );
});


it("should get a challenge based on id",()=>{
  // make sure it's not coming from cache
  ChallengeDB.cache = {};
  const id = "test-id-foo";

  return ChallengeDB.get(id).then((c)=> {
    expect(c.id == id).toBeTruthy();
  });
});

it("it should create a safe slug from unsafe text", ()=> {
  const s = "My--Super-hot_Video!🔥🔥🔥.2018.03.01.mov";
  const slug = ChallengeDB.slug(s);
  console.log(slug);
  const ex = "my-super-hot_video.2018.03.01.mov";
  expect(slug).toBe(ex)
});

it("should find a new unique id", ()=>{
    ChallengeDB.cache = {};

    const id = "test-id-foo";
    return ChallengeDB.uniqueId(id).then(
      (newId)=> {
        console.log("newId: " + newId);
        expect(newId).toBeTruthy();
        expect(id == newId).toBeFalsy();
      });
}, longTimeout);

it("should add a new challenge", ()=>{
  ChallengeDB.cache = {};

  let c = Challenge;
  c.id = null;
  c.owner = {
    "email": "mcuringa@adelphi.edu",
    "first": "Antonio",
    "last": "Gramsci"
  };
  c.title = "Jest Unit Test";
  c.prmpt = "Created as a unit test...";
  
  return ChallengeDB.add(c).then((c)=>{
    expect(c).toBeDefined();
  });
}, longTimeout);

it("should update a challenge", ()=>{
  let c = Challenge;
  c.id = "test-id-foo";
  c.owner = {
    "email": "mcuringa@adelphi.edu",
    "first": "Antonio",
    "last": "Gramsci"
  };
  c.title = "Jest Unit Test Challenge";
  c.prompt = "Created as a unit test...";
  c.assignments = {"foo": ["bar","jar"], "bar": ["foor","baz"]};
  
  return ChallengeDB.set(c).then((c)=>{
    expect(c).toBeDefined();
  });
});

it("should add a response to test-id-foo",()=>{
  const cId = "policy-changes-break-everything";
  let r = Response;
  r.text = "I think...";
  r.user = User;
  return ChallengeDB.addResponse(cId, r).then(()=>{
    console.log("response added");
  });
});

it("should get all responses in a challenge",()=>{
  const id = "policy-changes-break-everything";
  return ChallengeDB.getResponses(id).then((t)=>{
    expect(t.length).toBeGreaterThan(0);
    expect(t[0].id).toBeDefined();
  });
});


it.only("should delete all pf the records starting with jest-unit-test or marked for delete", ()=>{
  
  return ChallengeDB.findAll().then((t)=> {
    t.forEach((c)=>{
      if(_.startsWith(c.id, "jest-unit-test") || c.status == 4)
        ChallengeDB.delete(c.id);
    });
  });
});

