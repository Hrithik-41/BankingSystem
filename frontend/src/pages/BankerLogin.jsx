import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BankerLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://bank-backend-629s.onrender.com/login/banker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.status === 200 && data.success) {
        setMessage("Login successful!");
        console.log("Banker data:", data);
        // Navigate to banker dashboard
        navigate("/banker-dashboard");
      } else {
        setMessage(data.message || "Login failed");
      }Z
      
    } catch (err) {
      console.error(err);
      setMessage("Network error");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <h2>Banker Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", padding: "8px", margin: "10px 0" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "8px", margin: "10px 0" }}
        />
        <button type="submit" style={{ padding: "10px 20px", marginTop: "10px" }}>
          Login
        </button>
      </form>
      <p>{message}</p>
    </div>
  );
}
