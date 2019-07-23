// src/components/ExternalApi.js

import React, { useState } from "react";
import { useAuth0 } from "../react-auth0-wrapper";

const PayloadsApi = () => {
  const [showResult, setShowResult] = useState(false);
  const [chatUsers, setChatUsers] = useState([]);
  const { getTokenSilently } = useAuth0();

  const callApi = async () => {
    try {
      const token = await getTokenSilently();
      console.log(token)
      const response = await fetch("/api/payloads", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const responseData = await response.text();
      console.log(responseData)
      setShowResult(true);
      setChatUsers(responseData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <h1>External API</h1>
      <button onClick={callApi}>Get Users API</button>
      <button onClick={callApi}>P API</button>
      <ul>
      {chatUsers.map((value, index) => {
        return <li key={index}>{`${value.payload}`}</li>
      })}
    </ul>
    </>
  );
};

export default PayloadsApi;