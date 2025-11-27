import { useEffect, useState } from "react";

export default function BankerDashboard() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch all customers
  const fetchCustomers = async () => {
    try {
      const res = await fetch("http://localhost:5001/customers");
      const data = await res.json();
      if (data.success) setCustomers(data.customers);
      else setMessage("Error fetching customers");
    } catch (err) {
      console.error(err);
      setMessage("Error fetching customers");
    }
  };

  // Fetch transactions for a customer
  const fetchTransactions = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5001/transactions/${userId}`);
      const data = await res.json();
      if (data.success) setTransactions(data.transactions);
      else setMessage("Error fetching transactions");
    } catch (err) {
      console.error(err);
      setMessage("Error fetching transactions");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleViewTransactions = (customer) => {
    setSelectedCustomer(customer);
    fetchTransactions(customer.id);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Banker Dashboard</h2>
      {message && <p style={{ color: "red" }}>{message}</p>}

      <h3>Customers</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "5px" }}>ID</th>
            <th style={{ border: "1px solid black", padding: "5px" }}>Name</th>
            <th style={{ border: "1px solid black", padding: "5px" }}>Username</th>
            <th style={{ border: "1px solid black", padding: "5px" }}>Email</th>
            <th style={{ border: "1px solid black", padding: "5px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td style={{ border: "1px solid black", padding: "5px" }}>{c.id}</td>
              <td style={{ border: "1px solid black", padding: "5px" }}>{c.name}</td>
              <td style={{ border: "1px solid black", padding: "5px" }}>{c.username}</td>
              <td style={{ border: "1px solid black", padding: "5px" }}>{c.email}</td>
              <td style={{ border: "1px solid black", padding: "5px" }}>
                <button onClick={() => handleViewTransactions(c)}>View Transactions</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCustomer && (
        <div>
          <h3>Transactions for {selectedCustomer.username}</h3>
          {transactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid black", padding: "5px" }}>Type</th>
                  <th style={{ border: "1px solid black", padding: "5px" }}>Amount</th>
                  <th style={{ border: "1px solid black", padding: "5px" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td style={{ border: "1px solid black", padding: "5px" }}>{t.type}</td>
                    <td style={{ border: "1px solid black", padding: "5px" }}>{t.amount}</td>
                    <td style={{ border: "1px solid black", padding: "5px" }}>{t.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
