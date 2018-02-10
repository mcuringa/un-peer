// ChallengeDB.test.js
import {ChallengeDB} from "./Challenge";

// it("foo",()=>{console.log("foo")});

// it("findAll test", async ()=>{
//   ChallengeDB.findAll(async (c)=> {
//     const len = await c[0].length;
//     const title = await c[0].title;
//     expect(len).toBeGreaterThan(0);
//     expect(title).anything();
    
//     });
// });


// it("test slug", ()=> {
//   const s = "  This is    Foo#@ Bar_22 🔥🔥";
//   const slug = ChallengeDB.slug(s);
//   const ex = "this-is-foo-bar_22";
//   console.log(slug);
// });

it("test add challenge", ()=>{
  let c =     {
    "start": new Date("2018-02-12T00:00:11.891Z"),
    "end": new Date("2018-02-19T23:59:11.891Z"),
    "owner": {
      "email": "mcuringa@adelphi.edu",
      "first": "Matt",
      "last": "Curinga"
    },    
    "title": "Jest Unit Test Challenge",
    "prompt": "Created as a unit test..."
  }
  ChallengeDB.add(c);

});