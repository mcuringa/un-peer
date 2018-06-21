import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import FBUtil from "./FBUtil";


const initFirebase = async ()=> {
  const fb = await FBUtil.init();
  return fb;
}

initFirebase();

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();


