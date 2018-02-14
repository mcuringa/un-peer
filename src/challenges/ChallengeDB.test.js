import FBUtil from "../FBUtil";
import _ from "lodash";
import {ChallengeDB, Challenge} from "./Challenge";

it("findAll test", ()=>{
  ChallengeDB.findAll(async (t)=> {
    const len = await t.length;
    // console.log(t);

    expect(len).toBeGreaterThan(0);
    const title = await t[0].title;
    expect(title).toEqual(expect.anything());
    
    });
});

it("test slug", ()=> {
  const s = "  This is    Foo#@ Bar_22 🔥🔥";
  const slug = ChallengeDB.slug(s);
  const ex = "this-is-foo-bar_22";
});

test("test unique key", ()=>{
    // expect.assertions(1);
    const id = "jest-unit-test-challenge";
    return ChallengeDB.uniqueId(id).then(
      (newId)=> {
        console.log("newId: " + newId);
        expect(newId).toBeTruthy();
        expect(id == newId).toBeFalsy();
      });
});

it("test set challenge", ()=>{
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
    console.log("Challenge set with id: " + c.id);
  });
});

test("test add challenge", ()=>{
  let c = Challenge;
  c.id = null;
  c.owner = {
    "email": "mcuringa@adelphi.edu",
    "first": "Antonio",
    "last": "Gramsci"
  };
  c.title = "Jest Unit Test Add Challenge";
  c.prmpt = "Created as a unit test...";

  
  return ChallengeDB.add(c).then((c)=>{
    console.log("Challenge added with id: " + c.id);
    expect(c).toBeDefined();
  });
});




it("test delete", ()=>{
  ChallengeDB.findAll((t)=> {
    t.forEach((c)=>{
      if(_.startsWith(c.id, "jest-unit-test"))
        ChallengeDB.delete(c.id);
    });
  });
});

