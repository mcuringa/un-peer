/* eslint-env jest */

import FBUtil from "../FBUtil";
import UserDB from "./UserDB";
import db from "../DBTools.js";

import _ from "lodash";


const mxcId = "qeNXoRsAlsVniTfGy1wHKMHpLIV2";

const longTimeout = 1000*60*30;

function rp() {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz _-!@$%^&*()[]{}';";
  chars = _.split(chars, "");
  const passLen = 16;

  let p = "";
  for(let i=0;i<passLen;i++)
    p += _.sample(chars);

  return p;
}

it("should add a bookmark for a user",()=>{

  const uid = "qeNXoRsAlsVniTfGy1wHKMHpLIV2";
  const c = {
    id: "what-about-the-careless-staff",
    title: "What about the careless staff?",
    start: new Date("2018-02-26T21:21:35.746Z"),
  };
  let o = {
    avgRating: 3.5,
    created: new Date("2018-02-26T21:21:35.746Z"),
    id: "9hJ3ccqz6aSaFwUPkDUXU2AbKX02",
    modified: new Date("2018-03-03T04:03:43.133Z"),
    text: "It’s a test",
    title: "Test response from Jingbo"
  }

  return UserDB.addBookmark(uid, o, c).then((b)=>{
      expect(b).toBeDefined();
      expect(b.challengeId).toBe(c.id);
    });

});


it("should find all bookmarks for a user",()=>{
  const uid = "qeNXoRsAlsVniTfGy1wHKMHpLIV2";
  return db.findAll("/users/qeNXoRsAlsVniTfGy1wHKMHpLIV2/bookmarks").then((bookmarks)=>{
      expect(bookmarks).toBeDefined();
    });
});

it("should delete a user's bookmarks",()=>{
  const uid = "qeNXoRsAlsVniTfGy1wHKMHpLIV2";
  const bookmarkId = "9hJ3ccqz6aSaFwUPkDUXU2AbKX02";
  return db.delete(`/users/${uid}/bookmarks`, bookmarkId).then(()=>{});
});



it.only("should add a user via cloud functions",()=>{
  let addUser = FBUtil.getFunction("hello");
  let x = addUser();
  console.log(x);

});


it.skip("should create a new user in auth and DB",()=>{
  const user = {
    email: "foo.0099@example.com",
    firstName: "foo",
    lastName: "bar",
    displayName: "Foo Bar",
  };

  return UserDB.create(user).then((u)=>{
    console.log(u.uid);
  });
}, longTimeout);


it("should load user extra info from DB",()=>{
  return UserDB.get(mxcId).then(
    (u)=>{
      expect(u.uid).toBe(mxcId);
    },
    (e)=>{
      console.log("no user: " + e);
    });
});

it.skip("should add a new user to DB",()=>{
  const user = {
    created: new Date(),
    uid: "0QuT7TbQvRXFwGgjIsjNbROVjmU2",
    firstName: "Dao",
    lastName: "Changes",
    email: "pchantes@gmail.com",
    roles: ["student","admin", "su"],
    student: true,
    admin: true,
    su: true
  }
  const save = (u)=>{ 
      u.created = new Date();
      return db.save("/users", u.uid, u);
    };
  return save(user).then((u)=>{
    console.log("user created");
  });

});


it("should load firebase auth",()=>{
  const firebase = FBUtil.init();
  expect(firebase).toBeDefined();
  firebase.auth();

});



