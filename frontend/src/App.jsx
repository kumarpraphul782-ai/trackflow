import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import Admin from "./pages/AdminPage.jsx";
import DeliveryDashboard from "./pages/DeliveryDashboard.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import StorePage from "./pages/StorePage.jsx";
import StoreDashboard from "./pages/StoreDashboard.jsx";


function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/customer" element={<CustomerDashboard />} />
     <Route path="/admin" element={<Admin />} />
      <Route path="/delivery" element={<DeliveryDashboard />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/marketplace/store/:id" element={<StorePage />} />
      <Route path="/store-dashboard" element={<StoreDashboard />} />
    </Routes>
  );
}

export default App;