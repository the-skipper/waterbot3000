import React, { useState, useEffect } from "react";
import { useAuth0 } from "../../react-auth0-wrapper";
const DashBoard = () => {
  const { loading, user } = useAuth0();
  const [chatUsers, setChatUsers] = useState([]);
  const [payloads, setPayloads] = useState([]);

  const { getTokenSilently } = useAuth0();

  useEffect(() => {
    getUsers().then(users => {
      if (!chatUsers) setChatUsers(chatUsers);
      
    });
    getPayloads().then(p=>{
      if (!payloads) setPayloads(p);
    })
  }, []);
  const getUsers = async () => {
    try {
      const token = await getTokenSilently();
      const response = await fetch("/api/chatusers", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const responseData = await response.json();
      setChatUsers(responseData);
    } catch (error) {
      console.error(error);
    }
  };

  const getPayloads = async () => {
    try {
      const token = await getTokenSilently();
      const response = await fetch("/api/payloads", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const responseData = await response.json();
      setChatUsers(responseData);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || !user) {
    return "Loading...";
  }

  return (
    <>
      <div id="accordion">
        <div className="card">
          <div className="card-header" id="headingOne">
            <h5 className="mb-0">
              <button
                className="btn btn-link"
                data-toggle="collapse"
                data-target="#collapseOne"
                aria-expanded="true"
                aria-controls="collapseOne"
              >
                Chatbot Users
              </button>
            </h5>
          </div>
          <div
            id="collapseOne"
            className="collapse show"
            aria-labelledby="headingOne"
            data-parent="#accordion"
          >
            <div className="card-body">
              <ul className="list-group">
                {chatUsers.map((value, index) => {
                  return (
                    <li className="list-group-item" key={index}>{`${
                      value.firstName
                    } ${value.lastName}`}</li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header" id="headingOne">
            <h5 className="mb-0">
              <button
                className="btn btn-link"
                data-toggle="collapse"
                data-target="#collapseOne"
                aria-expanded="true"
                aria-controls="collapseOne"
              >
                Chatbot Users
              </button>
            </h5>
          </div>
          <div
            id="collapseOne"
            className="collapse show"
            aria-labelledby="headingOne"
            data-parent="#accordion"
          >
            <div className="card-body">
              <ul className="list-group">
                {payloads.map((value, index) => {
                  return (
                    <li className="list-group-item" key={index}>{`${
                      value.payload
                    }`}</li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashBoard;
