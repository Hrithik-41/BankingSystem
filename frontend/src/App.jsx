
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import CustomerLogin from "./pages/CustomerLogin";
import BankerLogin from "./pages/BankerLogin";
import CustomerDashboard from "./pages/CustomerDashboard";
import BankerDashboard from "./pages/BankerDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <header style={{ background: "#0b5fff", padding: "10px", color: "white" }}>
        <h1>Hrithik's Bank</h1>
        <nav>
          <Link to="/" style={{ color: "white", marginRight: "20px" }}>Customer Login</Link>
          <Link to="/banker-login" style={{ color: "white" }}>Banker Login</Link>
        </nav>
      </header>

      <main style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<CustomerLogin />} />
          <Route path="/banker-login" element={<BankerLogin />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/banker-dashboard" element={<BankerDashboard />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

