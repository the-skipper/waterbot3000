import React, { useState, useEffect } from "react";
import Payload from "../Payloads/Payloads";
import { useAuth0 } from "../../react-auth0-wrapper";
const DashBoard = () => {
  const { loading, user } = useAuth0();
  const [chatUsers, setChatUsers] = useState([]);
  const [payloads, setPayloads] = useState([]);
  const [mtext, setMText] = useState([]);


  const { getTokenSilently } = useAuth0();

  useEffect(() => {
    getUsers().then(users => {
      if (!chatUsers) setChatUsers(chatUsers);
    });
    getPayloads().then(p => {
      if (!payloads) setPayloads(payloads);
    });
  }, []);

  const handleMessageSubmit = async e => {
    e.preventDefault();
    const v = new FormData(e.target).entries();

    try {
      const token = await getTokenSilently();

      const params = new URLSearchParams([...v]);
      const response = await fetch("/api/message", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: params
      });
      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.error(error);
    }
  };


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
      setPayloads(responseData);
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
              {chatUsers.length && (
                <ul className="list-group">
                  {chatUsers.map((value, index) => {
                    return (
                      <li className="list-group-item" key={index}>{`${
                        value.firstName
                      } ${value.lastName}`}</li>
                    );
                  })}
                </ul>
              )}
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
                Chatbot Payloads
              </button>
            </h5>
          </div>
          <div
            className="collapse show"
            aria-labelledby="headingOne"
            data-parent="#accordion"
          >
            <div className="card-body">
              {payloads.length && (
                <ul className="list-group">
                  {payloads.map((value, index) => {
                    return <Payload key={index} payload={value} />;
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
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
                Message users
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
                <li className="list-group-item">
                  <label>Send message to all users</label>
                  <form onSubmit={handleMessageSubmit}>
                    <label>
                      <input
                        name="message"
                        type="text"
                        value={mtext}
                        onChange={e => {
                          setMText(e.target.value);
                        }}
                      />
                    </label>
                    <input type="submit" value="Send" />
                  </form>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashBoard;
