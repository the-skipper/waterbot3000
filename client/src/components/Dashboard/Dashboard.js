import React from "react";
import { useAuth0 } from "../../react-auth0-wrapper";

const Profile = () => {
  const { loading, user } = useAuth0();

  if (loading || !user) {
    return "Loading...";
  }

  return (
    <>
     <h1>Welcome to the Dashboard</h1>
    </>
  );
};

export default Profile;