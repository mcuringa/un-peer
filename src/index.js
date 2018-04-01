import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
// import localforage from "localforage";
// import _ from "lodash"

// _.once(()=>{
//   console.log("forage configured");
//   localforage.config({
//     driver: [localforage.INDEXEDDB,
//              localforage.WEBSQL,
//              localforage.LOCALSTORAGE],
//     name: 'UN-Peer'
//   });  
// });


ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

