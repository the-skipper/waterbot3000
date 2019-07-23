import React from "react";
import "./App.css";

import NavBar from "../Navbar/NavBar";
import Dashboard from "../Dashboard/Dashboard";
import PrivateRoute from "../PrivateRoute";

import { BrowserRouter, Route, Switch } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <NavBar />
        <header className="Header" />
        <Switch>
          <Route path="/" exact />
          <PrivateRoute path="/dashboard" component={Dashboard} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
