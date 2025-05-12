import React, { useState, useContext } from "react";
import { AuthContext } from "../App";

const API_URL = "http://localhost:8080/api";

function AuthForm() {
  const { login } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const endpoint = isRegister ? "/register" : "/login";
    try {
      const res = await fetch(API_URL + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (isRegister && res.status === 201) {
        // Automatically log in after registration
        const loginRes = await fetch(API_URL + "/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (loginRes.ok) {
          const data = await loginRes.json();
          login(data.token, email);
        } else {
          setIsRegister(false);
          setError("Registration successful! Please log in.");
        }
        return;
      }
      if (!isRegister && res.ok) {
        const data = await res.json();
        login(data.token, email);
      } else {
        const msg = await res.text();
        setError(msg || "Authentication failed");
        setPassword(""); // Clear password field on error
      }
    } catch (err) {
      setError("Network error");
      setPassword(""); // Clear password field on error
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-heading">Task Management App</div>
      <div className="auth-form-centered">
        <div className="auth-form-card">
          <h2 style={{ textAlign: "center", marginBottom: 20 }}>{isRegister ? "Register" : "Login"}</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
            />
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, width: '100%', boxSizing: 'border-box', paddingRight: 36 }}
              />
              <span
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  fontSize: 18,
                  color: '#888',
                  userSelect: 'none',
                  height: 24,
                  width: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 10C2 10 4.5 5 10 5C15.5 5 18 10 18 10C18 10 15.5 15 10 15C4.5 15 2 10 2 10Z" stroke="#888" strokeWidth="1.5" fill="none"/>
                    <circle cx="10" cy="10" r="3" stroke="#888" strokeWidth="1.5" fill="none"/>
                    <line x1="4" y1="16" x2="16" y2="4" stroke="#888" strokeWidth="1.5"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 10C2 10 4.5 5 10 5C15.5 5 18 10 18 10C18 10 15.5 15 10 15C4.5 15 2 10 2 10Z" stroke="#888" strokeWidth="1.5" fill="none"/>
                    <circle cx="10" cy="10" r="3" stroke="#888" strokeWidth="1.5" fill="none"/>
                  </svg>
                )}
              </span>
            </div>
            <button type="submit" style={{ padding: 12, borderRadius: 6, background: '#3a2fd8', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer' }}>{isRegister ? "Register" : "Login"}</button>
          </form>
          {error && <div style={{ color: "red", marginTop: 8, textAlign: 'center' }}>{error}</div>}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            {isRegister ? (
              <span>
                Already have an account?{" "}
                <button style={{ background: 'none', border: 'none', color: '#3a2fd8', cursor: 'pointer', textDecoration: 'underline', fontWeight: 500 }} onClick={() => setIsRegister(false)}>Login</button>
              </span>
            ) : (
              <span>
                New user?{" "}
                <button style={{ background: 'none', border: 'none', color: '#3a2fd8', cursor: 'pointer', textDecoration: 'underline', fontWeight: 500 }} onClick={() => setIsRegister(true)}>Register</button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm; 