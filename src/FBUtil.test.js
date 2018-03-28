import FBUtil from "./FBUtil";

it("loads auth user using FBUtil",()=>{

  const userListener = (authUser)=> {
    console.log("authUser");
    console.log(authUser);
  }


  return FBUtil.getAuthUser(userListener).then(()=>{
    console.log("got auth");
  });
})

it.only("authenticates with test email",()=>{

  const email = "test@example.com";
  const pw = "testing";
  let firebase = FBUtil.init();
  return firebase.auth().signInWithEmailAndPassword(email, pw)
    .then(()=>{
      console.log("signed in");
    }).catch((e)=>{
      console.log(e);
    });
})