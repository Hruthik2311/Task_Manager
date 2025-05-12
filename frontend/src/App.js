import React, { useState, useEffect, createContext } from "react";
import './App.css';
import AuthForm from "./components/AuthForm";
import TaskManager from "./components/TaskManager";
import LogoutButton from "./components/LogoutButton";

// Export AuthContext as a named export
export const AuthContext = createContext();

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail") || "");

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem("userEmail", userEmail);
    } else {
      localStorage.removeItem("userEmail");
    }
  }, [userEmail]);

  const login = (token, email) => {
    setToken(token);
    setUserEmail(email);
  };

  const logout = () => {
    setToken("");
    setUserEmail("");
  };

  return (
    <AuthContext.Provider value={{ token, userEmail, login, logout }}>
      <div>
        {token ? (
          <>
            <LogoutButton />
            <TaskManager />
          </>
        ) : (
          <AuthForm />
        )}
      </div>
    </AuthContext.Provider>
  );
}
