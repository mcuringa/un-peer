import React, { Component } from "react";

import {
    BrowserRouter as Router,
    Route,
    Link,
    Switch
} from 'react-router-dom';

import Home from './Home.js';
import Login from './Login.js';

export default class App extends Component {
    render() {
      return (
          <Router>
              <div>
                  <Link to="/">Home</Link>{' '}
                  <Link to="/login">Login</Link>

                  <Switch>
                      <Route exact path="/" component={Home} />
                      <Route path="/login" component={Login} />
                      <Route render={() => <h1>Page not found</h1>} />
                  </Switch>
              </div>
          </Router>
      );
    }
}
