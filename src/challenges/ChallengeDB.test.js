import FBUtil from "../FBUtil";
import _ from "lodash";
import {ChallengeDB} from "./Challenge";

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

it("test unique key", async ()=>{
    let db = FBUtil.connect();
    let count = 1;
    let doc = await db.collection("challenges")
      .doc("jest-unit-test-challenge").get();
    let exists = await doc.exists;
    expect(exists).toBeTruthy();
});

it("test add challenge", ()=>{
  let c =     {
    "start": new Date("2018-02-12T00:00:11.891Z"),
    "end": new Date("2018-02-19T23:59:11.891Z"),
    "owner": {
      "email": "mcuringa@adelphi.edu",
      "first": "Antonio",
      "last": "Gramsci"
    },    
    "title": "Jest Unit Test Challenge",
    "prompt": "Created as a unit test..."
  }
  ChallengeDB.add(c);
});

it("test delete", ()=>{
  ChallengeDB.findAll((t)=> {
    t.forEach((c)=>{
      if(_.startsWith(c.id, "jest-unit-test-challenge"))
        ChallengeDB.delete(c.id);
    });
  });
});

