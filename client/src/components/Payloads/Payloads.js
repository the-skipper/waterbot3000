import React, { useState } from "react";
import { useAuth0 } from "../../react-auth0-wrapper";
const Payload = (props) => {
  const { loading, user } = useAuth0();
  const { getTokenSilently } = useAuth0();
  const [pltext, setText] = useState("");

  if (loading || !user) {
    return "Loading...";
  }

  const handleSubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    fd.append("payload", props.payload.payload);
    const v =fd.entries();
    
    try {
      const token = await getTokenSilently();

      const params = new URLSearchParams([...v]);
      const response = await fetch("/api/payloads", {
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

  return (
    <li className="list-group-item">
      <label>{props.payload.payload}</label>
      <form onSubmit={handleSubmit}>
        <label>
          {(pltext && pltext) || props.payload.text} <br />
          <input
            name="text"
            type="text"
            value={pltext}
            onChange={e => {
              setText(e.target.value);
            }}
          />
        </label>
        <input type="submit" value="Save" />
      </form>
    </li>
  );
};

export default Payload;
