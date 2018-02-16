import FBUtil from "../FBUtil";
import _ from "lodash";
import {ChallengeDB, Challenge, Response, User} from "./Challenge";


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

it("should get a challenge based on id",()=>{
  // make sure it's not coming from cache
  ChallengeDB.cache = {};
  const id = "test-id-foo";

  return ChallengeDB.get(id).then((c)=> {
    expect(c.id == id).toBeTruthy();
  });
});

it("it should create a safe slug from unsafe text", ()=> {
  const s = "  This is    Foo#@ Bar_22 🔥🔥  ";
  const slug = ChallengeDB.slug(s);
  const ex = "this-is-foo-bar_22";
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
});

it("should add a new challenge challenge", ()=>{
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
});

it("should update a challenge", ()=>{
  let c = Challenge;
  c.id = "test-id-foo";
  c.owner = {
    "email": "mcuringa@adelphi.edu",
    "first": "Antonio",
    "last": "Gramsci"
  };
  c.title = "Jest Unit Test Challenge";
  c.prmpt = "Created as a unit test...";

  
  return ChallengeDB.set(c).then((c)=>{
    expect(c).toBeDefined();
  });
});

it.only("should add a response to test-id-foo",()=>{
  const cId = "test-id-foo";
  let r = Response;
  r.text = "I think...";
  r.user = User;
  return ChallengeDB.addResponse(cId, r).then(()=>{
    console.log("response added");
  });
});


it("should delete all pf the records starting iwth jest-unit-test", ()=>{
  ChallengeDB.findAll((t)=> {
    t.forEach((c)=>{
      if(_.startsWith(c.id, "jest-unit-test"))
        ChallengeDB.delete(c.id);
    });
  });
});

