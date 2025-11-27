import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function CustomerDashboard() {
  const location = useLocation();
  const { username, userId } = location.state;

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  // Fetch transactions and update balance
  const fetchTransactions = async () => {
    try {
      const res = await fetch(`http://localhost:5001/transactions/${userId}`);
      const data = await res.json();

      if (data.success) {
        setTransactions(data.transactions);

        // Calculate current balance
        const currentBalance = data.transactions.reduce((acc, t) => {
          const amt = parseFloat(t.amount);
          if (t.type === "deposit") return acc + amt;
          else return acc - amt;
        }, 0);
        setBalance(currentBalance);
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error fetching transactions");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleTransaction = async (type) => {
    if (!amount || parseFloat(amount) <= 0) {
      setMessage("Enter a valid amount");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5001/transactions/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount: parseFloat(amount) })
      });
      const data = await res.json();

      if (data.success) {
        setMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} successful`);
        setAmount("");
        fetchTransactions(); // Refresh balance and transactions
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto", textAlign: "center" }}>
      <h2>Welcome, {username}</h2>
      <p>Current Balance: ₹{balance.toFixed(2)}</p>

      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: "100%", padding: "8px", margin: "10px 0" }}
      />
      <div>
        <button onClick={() => handleTransaction("deposit")} style={{ marginRight: "10px" }}>Deposit</button>
        <button onClick={() => handleTransaction("withdraw")}>Withdraw</button>
      </div>

      {message && <p>{message}</p>}

      <h3>Transaction History</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black" }}>Type</th>
            <th style={{ border: "1px solid black" }}>Amount</th>
            <th style={{ border: "1px solid black" }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td style={{ border: "1px solid black" }}>{t.type}</td>
              <td style={{ border: "1px solid black" }}>{parseFloat(t.amount).toFixed(2)}</td>
              <td style={{ border: "1px solid black" }}>{new Date(t.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
