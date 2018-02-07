import React, { Component } from 'react';

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import ChallengeListScreen from './challenges/Challenges.js';
import ChallengeDetailScreen from './challenges/ChallengeDetail.js';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <div className="App">
            <header className="App-header">
              <h1 className="App-title">UN Peer Challenges</h1>
            </header>
          </div>
          <section id="main">
            <Route exact path="/" component={ChallengeListScreen}/>
            <Route path="/challenge/:id" component={ChallengeDetailScreen} />
          </section>
        </div>
    </Router>
    );
  }
}

export default App;
