import React from "react";
import "./App.css";

import NavBar from "../Navbar/NavBar";
import Profile from "../Profile/Profile";
import Dashboard from "../Dashboard/Dashboard";
import PrivateRoute from "../PrivateRoute";

import { BrowserRouter, Route, Switch } from "react-router-dom";
import PayloadsApi from "../PayloadsApi";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <NavBar />
        <header className="Header" />
        <Switch>
          <Route path="/" exact />
          <PrivateRoute path="/profile" component={Profile} />
          <PrivateRoute path="/dashboard" component={Dashboard} />
          <PrivateRoute path="/payloads" component={PayloadsApi} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
