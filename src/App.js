import React, { Component } from "react";

import {
    BrowserRouter as Router,
    Route,
    Redirect,
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
                      <Route exact path="/" render={() => (
                          isLoggedIn() ? (
                              <Redirect to="/login"/>
                          ) : (
                              <Home />
                          )
                      )}/>
                      <Route path="/login" component={Login} />
                      <Route render={() => <h1>Page not found</h1>} />
                  </Switch>
              </div>
          </Router>
      );
    }
}

function isLoggedIn () {
    return false;
}

class RequireAuthentication extends Component {
    render() {
        alert ("Hi");
        return (
            <Redirect to="/login"/>
        );
    }
}


function requireAuth(nextState, replace, next) {
    alert ("Hi");
    var authenticated = true;
    if (!authenticated) {
        replace({
            pathname: "/login",
            state: {nextPathname: nextState.location.pathname}
        });
    }
    next();
}
