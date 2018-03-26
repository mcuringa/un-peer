import config from "./firebase.config.json";
let firebase = require("firebase");
require("firebase/auth");
require("firebase/firestore");
require("firebase/storage");

firebase.initializeApp(config);

require("firebase/functions")

it("initializes a database connection",()=>{
  let db = firebase.firestore();
  expect(db).toBeDefined();
})

it("can load functions",()=>{
  let functions = firebase.functions();
  expect(functions).toBeDefined();

})

it("calls the hello function",()=>{
  let functions = firebase.functions();
  const hello = functions.httpsCallable("hello");
  expect(hello).toBeDefined();
})