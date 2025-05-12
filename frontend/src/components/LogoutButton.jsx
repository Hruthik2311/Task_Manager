import React, { useContext } from "react";
import { AuthContext } from "../App";

function LogoutButton() {
  const { logout, userEmail } = useContext(AuthContext);
  return (
    <div className="logout-bar">
      <span>User: <b>{userEmail}</b></span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default LogoutButton; 