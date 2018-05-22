import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap';
import './index.css';

import App from './App';
import registerServiceWorker from './registerServiceWorker';
import FBUtil from "./FBUtil";

const initFB = async ()=> {
  const fb = await FBUtil.init();
  return fb;
}

initFB();


ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();


