import React, { Component } from 'react';
import { Router, Route, Switch } from 'react-router'
import './App.css';
import challenges from './challenges.json';

import ChallengeList from './Challenges.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">United Nations Peer Foo</h1>
        </header>
        <section id="main">
          <ChallengeList challenges={challenges} />
        </section>
      </div>
    );
  }
}

export default App;
