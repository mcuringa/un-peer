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



