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
        <div className="App">
          <header className="App-header container">
            <nav className="App-header-nav">
              <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
              </button>
               <div className="collapse navbar-collapse" id="navbarTogglerDemo03">
                <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
                  <li className="nav-item active">
                    <Link className="nav-link" to="/">Dashboard</Link>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">Current Challenge</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">Review Challenge</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">Suggest a Challenge</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">Archives</a>
                  </li>
                </ul>
              </div>
              <div className="App-title navbar-brand">UN Peer Challenges</div>
            </nav>
          </header>
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
