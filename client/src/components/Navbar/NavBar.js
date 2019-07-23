import React from "react";
import { useAuth0 } from "../../react-auth0-wrapper";
import { Link } from "react-router-dom";

const NavBar = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light" >
      
      {!isAuthenticated && (
        <button className="btn btn-outline-dark" onClick={() => loginWithRedirect({})}>Log in</button>
      )}

      {isAuthenticated && <button className="btn btn-outline-dark" onClick={() => logout()}>Log out</button>}

      {isAuthenticated && (
        <span>
          <Link to="/">Home</Link>&nbsp;
          <Link to="/dashboard">Dashboard</Link>
        </span>
      )}



    </nav>
  );
};

export default NavBar;
