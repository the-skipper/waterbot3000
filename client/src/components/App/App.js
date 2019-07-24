import React from "react";
import "./App.css";

import NavBar from "../Navbar/NavBar";
import Dashboard from "../Dashboard/Dashboard";
import PrivateRoute from "../PrivateRoute";
import { useAuth0 } from "../../react-auth0-wrapper";

import { BrowserRouter, Route, Switch } from "react-router-dom";

function App() {
  const { loading } = useAuth0();
  if (loading) {
    return (
      <div className="spinner-border" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
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
