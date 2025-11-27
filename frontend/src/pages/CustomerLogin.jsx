import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CustomerLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://bank-backend-629s.onrender.com/login/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.status === 200 && data.success) {
        setMessage("Login successful!");
        // Navigate to dashboard and pass username & userId
        navigate("/customer-dashboard", { state: { username, userId: data.userId } });
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <h2>Customer Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", padding: "8px", margin: "10px 0" }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "8px", margin: "10px 0" }}
          required
        />
        <button type="submit" style={{ padding: "10px 20px", marginTop: "10px" }}>Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
}