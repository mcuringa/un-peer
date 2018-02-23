import FBUtil from "../FBUtil";
import UserDB from "./UserDB";
import _ from "lodash";

const mxcId = "qeNXoRsAlsVniTfGy1wHKMHpLIV2";

function rp() {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz _-!@$%^&*()[]{}';";
  chars = _.split(chars, "");
  const passLen = 16;

  let p = "";
  for(let i=0;i<passLen;i++)
    p += _.sample(chars);

  return p;
}

it("should load user extra info from DB",()=>{
  return UserDB.get(mxcId).then(
    (u)=>{
      console.log("user found: " + u.uid);
    },
    (e)=>{
      console.log("no user: " + e);
    });
});

it("should add a new user to DB",()=>{
  const user = {
    created: new Date(),
    uid: mxcId,
    email: "matt@curinga.com",
    roles: ["student","admin", "su"],
    student: true,
    admin: true,
    su: true
  }
  return UserDB.save(user).then((u)=>{
    console.log("user created");
  });

});


it("should load firebase auth",()=>{
  const firebase = FBUtil.init();
  expect(firebase).toBeDefined();
  firebase.auth();

});



