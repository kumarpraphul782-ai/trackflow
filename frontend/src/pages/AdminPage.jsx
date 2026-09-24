import './AdminPage.css'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import socket from "../socket";
import API_URL from "../config";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function Admin() {
  const [formData, setFormData] = useState({
    trackingId: "",
    from: "",
    to: "",
    status: "Picked Up",
  });
const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [shipments, setShipments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [stores, setStores] = useState([]);
  const [pendingStores, setPendingStores] = useState([]);
  const totalShipments = shipments.length;

const inTransit = shipments.filter(
  (shipment) => shipment.status === "In Transit"
).length;

const outForDelivery = shipments.filter(
  (shipment) => shipment.status === "Out for Delivery"
).length;


const delivered = shipments.filter(
  (shipment) => shipment.status === "Delivered"
).length;
const chartData = [
  { name: "In Transit", shipments: inTransit },
  { name: "Out for Delivery", shipments: outForDelivery },
  { name: "Delivered", shipments: delivered },
];
const COLORS = [
  "#22c55e",
  "#f59e0b",
  "#3b82f6",
];

  const [updateData, setUpdateData] = useState({
  trackingId: "",
  status: "Picked Up",
});

const [updateMessage, setUpdateMessage] = useState("");

const generateTrackingId = () => {
  return "TRK" + Date.now().toString().slice(-8);
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Creating shipment...");

  

    try {

       const shipmentData = {
  ...formData,
  trackingId: generateTrackingId(),
  user: JSON.parse(localStorage.getItem("user"))?._id,
};

      const response = await
      
      fetch(`${API_URL}/api/shipments`, {
      method: "POST",
       headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(shipmentData),
});

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to create shipment");
        return;
      }

      setMessage(
  `Shipment created successfully! ✅ Tracking ID: ${data.shipment.trackingId}`
);

await fetchShipments();

setUpdateData({
  trackingId: data.shipment.trackingId,
  status: "Picked Up",
});

      setFormData({
        from: "",
        to: "",
        status: "Picked Up",
      });
    } catch (error) {
      console.error(error);
      setMessage("Server connection error");
    }
  };
const handleUpdate = async (e) => {
  e.preventDefault();
  setUpdateMessage("Updating shipment...");

  try {
    const response = await fetch(
  `${API_URL}/api/shipments/${updateData.trackingId.trim()}`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: updateData.status,
    }),
  }
);

    const data = await response.json();

    if (!response.ok) {
      setUpdateMessage(data.message || "Unable to update shipment");
      return;
    }

    setUpdateMessage("Shipment status updated successfully! ✅");

    await fetchShipments();

    setUpdateData({
      trackingId: "",
      status: "Picked Up",
    });
  } catch (error) {
    console.error(error);
    setUpdateMessage("Server connection error");
  }
};

const handleDecline = async (request) => {
  try {
    const response = await fetch(
      `${API_URL}/api/shipment-request/${request._id}/decline`,
      {
        method: "PUT",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    alert("Shipment request declined successfully! ❌");

    await fetchRequests();

  } catch (error) {
    console.error(error);
    alert("Server connection error");
  }
};

const fetchShipments = async () => {
  try {
    const admin = JSON.parse(localStorage.getItem("user"));

    const response = await fetch(
      `${API_URL}/api/shipments?adminId=${admin._id}`
    );

    const data = await response.json();

    if (response.ok) {
      setShipments(data);
    }
  } catch (error) {
    console.error(error);
  }
};
const fetchRequests = async () => {
  try {
    const response = await fetch(
      `${API_URL}/api/shipment-request`
    );

    const data = await response.json();

    if (response.ok) {
      setRequests(data);
    }
  } catch (error) {
    console.error(error);
  }
};

const handleDelete = async (trackingId) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this shipment?"
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(
      `${API_URL}/api/shipments/${trackingId}`,
      {
        method: "DELETE",
      }
    );
   

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    alert("Shipment deleted successfully! ✅");

    await fetchShipments();
  } catch (error) {
    console.error(error);
    alert("Server connection error");
  }
};
const fetchDeliveryBoys = async () => {
  try {
    const response = await fetch(
      `${API_URL}/api/delivery-boys`
    );

    const data = await response.json();

    if (response.ok) {
      setDeliveryBoys(data);
    }
  } catch (error) {
    console.error(error);
  }
};
const fetchStores = async () => {
  try {
    const response = await fetch(
      `${API_URL}/api/admin/stores`
    );

    const data = await response.json();

    if (response.ok) {
      setStores(data);
      setPendingStores(data.filter((s) => s.status === "pending"));
    }
  } catch (error) {
    console.error(error);
  }
};
const handleStoreAction = async (store, action) => {
  try {
    const response = await fetch(
      `${API_URL}/api/stores/${store._id}/${action}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    alert(
      action === "approve"
        ? `"${store.name}" approved and now live! ✅`
        : `"${store.name}" rejected. ❌`
    );

    await fetchStores();
  } catch (error) {
    console.error(error);
    alert("Server connection error");
  }
};
const handleAccept = async (request) => {
  try {
   const admin = JSON.parse(localStorage.getItem("user"));

const response = await fetch(
  `${API_URL}/api/shipment-request/${request._id}/accept`,
  {
    method: "PUT",
    headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
},
    body: JSON.stringify({
      
    }),
  }
);

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    alert("Shipment accepted successfully! ✅");

    await fetchShipments();
    await fetchRequests();

  } catch (error) {
    console.error(error);
    alert("Server connection error");
  }
};
    useEffect(() => {
  fetchShipments();
  fetchRequests();
fetchDeliveryBoys();
fetchStores();
  socket.on("connect", () => {
  });
  socket.emit("test");

  socket.on("new-request", () => {
    fetchRequests();
  });
  socket.on("request-updated", () => {
  fetchRequests();
  fetchShipments();
});

socket.on("shipment-status-updated", () => {
  fetchShipments();
});

  return () => {
  socket.off("connect");
  socket.off("new-request");
  socket.off("request-updated");
  socket.off("shipment-status-updated");
};
}, []);
  return (
    <div className="admin-page">
        <div className="admin-container">
      <div className="admin-header">
  <div>
    <h1>
      Admin Panel
      <span className="verified">✔</span>
    </h1>

    <p>Manage and track all shipments in real-time.</p>
  </div>
</div>

<motion.div
  className="dashboard-cards"
  variants={staggerContainer}
  initial="hidden"
  animate="show"
>
<motion.div
  className="card blue-card"
  onClick={() => setStatusFilter("All")}
  style={{ cursor: "pointer" }}
  variants={fadeUp}
  whileHover={{ scale: 1.03, y: -8 }}
  whileTap={{ scale: 0.98 }}
>
  
    <div className="card-top">
      <div className="card-icon">📦</div>

      <div>
        <h3>Total Shipments</h3>
        <h2>{totalShipments}</h2>
      </div>
    </div>

    <div className="wave"></div>
  </motion.div>


  <motion.div
  className="card green-card"
  onClick={() => setStatusFilter("In Transit")}
  style={{ cursor: "pointer" }}
  variants={fadeUp}
  whileHover={{ scale: 1.03, y: -8 }}
  whileTap={{ scale: 0.98 }}
>
    <div className="card-top">
      <div className="card-icon">🚚</div>

      <div>
        <h3>In Transit</h3>
        <h2>{inTransit}</h2>
      </div>
    </div>

    <div className="wave"></div>
  </motion.div>


  <motion.div
  className="card orange-card"
  onClick={() => setStatusFilter("Out for Delivery")}
  style={{ cursor: "pointer" }}
  variants={fadeUp}
  whileHover={{ scale: 1.03, y: -8 }}
  whileTap={{ scale: 0.98 }}
>
    <div className="card-top">
      <div className="card-icon">🚛</div>

      <div>
        <h3>Out for Delivery</h3>
        <h2>{outForDelivery}</h2>
      </div>
    </div>

    <div className="wave"></div>
  </motion.div>


  <motion.div
  className="card teal-card"
  onClick={() => setStatusFilter("Delivered")}
  style={{ cursor: "pointer" }}
  variants={fadeUp}
  whileHover={{ scale: 1.03, y: -8 }}
  whileTap={{ scale: 0.98 }}
>
    <div className="card-top">
      <div className="card-icon">✅</div>

      <div>
        <h3>Delivered</h3>
        <h2>{delivered}</h2>
      </div>
    </div>

    <div className="wave"></div>
  </motion.div>

</motion.div>

<motion.div
  className="form-section"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.3 }}
>
  <h2>📊 Shipment Analytics</h2>

  <div
  style={{
    display: "flex",
    gap: "20px",
    alignItems: "center",
  }}
>
    <div style={{ flex: 2, height: "350px" }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar
    
  dataKey="shipments"
  radius={[8, 8, 0, 0]}
  label={{ position: "top" }}
>
    
  {chartData.map((entry, index) => (
    <Cell
      key={`cell-${index}`}
      fill={COLORS[index % COLORS.length]}
    />
  ))}
  
</Bar>
      </BarChart>
    </ResponsiveContainer>
    </div>
    <div style={{ flex: 1, height: "350px" }}>
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={chartData}
        dataKey="shipments"
        nameKey="name"
        outerRadius={120}
        label
      >
        {chartData.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>

      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>
  </div>
</motion.div>

<motion.div
  className="form-section"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.4 }}
>
  <h2>Create New Shipment</h2>

  <form className="admin-form" onSubmit={handleSubmit}>

    <input
      type="text"
      name="from"
      placeholder="From - e.g. Patna, Bihar"
      value={formData.from}
      onChange={handleChange}
      required
    />

    <input
      type="text"
      name="to"
      placeholder="To - e.g. Bhubaneswar, Odisha"
      value={formData.to}
      onChange={handleChange}
      required
    />

    <select
      name="status"
      value={formData.status}
      onChange={handleChange}
    >
      <option value="Picked Up">Picked Up</option>
      <option value="Origin Hub">Origin Hub</option>
      <option value="In Transit">In Transit</option>
      <option value="Destination Hub">Destination Hub</option>
      <option value="Out for Delivery">Out for Delivery</option>
      <option value="Delivered">Delivered</option>
    </select>

    <button type="submit">Create Shipment</button>

  </form>

  {message && (
    <div className="success-message">
      {message}
    </div>
  )}
</motion.div>

<motion.div
  className="form-section"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.5 }}
>
  <h2>Update Shipment Status</h2>

  <form className="admin-form" onSubmit={handleUpdate}>
  <input
    type="text"
    placeholder="Tracking ID"
    value={updateData.trackingId}
    onChange={(e) =>
      setUpdateData({
        ...updateData,
        trackingId: e.target.value,
      })
    }
    required
  />

  <select
    value={updateData.status}
    onChange={(e) =>
      setUpdateData({
        ...updateData,
        status: e.target.value,
      })
    }
  >
    <option value="Picked Up">Picked Up</option>
    <option value="Origin Hub">Origin Hub</option>
    <option value="In Transit">In Transit</option>
    <option value="Destination Hub">Destination Hub</option>
    <option value="Out for Delivery">Out for Delivery</option>
    <option value="Delivered">Delivered</option>
  </select>

  <button type="submit">Update Status</button>
</form>

{updateMessage && (
  <div className="success-message">
    {updateMessage}
  </div>
)}
</motion.div>

<motion.div
  className="form-section"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.6 }}
>
  <h2>Shipment Requests</h2>

  <table className="shipment-table">
    <thead>
      <tr>
        <th>Receiver</th>
        <th>From</th>
        <th>To</th>
        <th>Parcel</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody>
      {requests.map((request) => (
        <tr key={request._id}>
          <td>{request.receiverName}</td>
          <td>{request.from}</td>
          <td>{request.to}</td>
          <td>{request.parcelType}</td>
          <td>{request.status}</td>
         <td>
  <button
    className="accept-btn"
    onClick={() => handleAccept(request)}
  >
    Accept
  </button>

  <button
    className="decline-btn"
    onClick={() => handleDecline(request)}
    style={{ marginLeft: "10px" }}
  >
    Decline
  </button>
</td>
        </tr>
      ))}
    </tbody>
  </table>
</motion.div>

<motion.div
  className="form-section"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.7 }}
>
<h2>All Shipments</h2>

<table className="shipment-table">
  <thead>
    <tr>
      <th>Tracking ID</th>
      <th>From</th>
      <th>To</th>
      <th>Status</th>
      <th>Action</th>
    </tr>
  </thead>

  <tbody>
    {shipments
  .filter(
    (shipment) =>
      statusFilter === "All" ||
      shipment.status === statusFilter
  )
  .map((shipment) => (
      <tr key={shipment._id}>
        <td>{shipment.trackingId}</td>
        <td>{shipment.from}</td>
        <td>{shipment.to}</td>
        <td>
  <span
    className={`status-badge ${shipment.status
      .toLowerCase()
      .replace(/\s+/g, "-")}`}
  >
    {shipment.status}
  </span>
</td>

<td>
  <button
  className="delete-btn"
  onClick={() => handleDelete(shipment.trackingId)}
>
  Delete
</button>
</td>

      </tr>
    ))}
  </tbody>
</table>
</motion.div>

<motion.div
  className="form-section"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.8 }}
>
<h2>Shop Listings — Pending Approval ({pendingStores.length})</h2>

<table className="shipment-table">
  <thead>
    <tr>
      <th>Shop Name</th>
      <th>Category</th>
      <th>Owner</th>
      <th>Address</th>
      <th>Action</th>
    </tr>
  </thead>

  <tbody>
    {pendingStores.length === 0 ? (
      <tr>
        <td colSpan="5">No shops waiting for approval 🎉</td>
      </tr>
    ) : (
      pendingStores.map((store) => (
        <tr key={store._id}>
          <td>
            <strong>{store.name}</strong>
            {store.description && (
              <div style={{ color: "#94a3b8", fontSize: "13px" }}>
                {store.description.slice(0, 60)}
              </div>
            )}
          </td>
          <td>{store.category}</td>
          <td>
            {store.owner && (
              <>
                {store.owner.name}
                <div style={{ color: "#94a3b8", fontSize: "13px" }}>
                  {store.owner.email}
                </div>
              </>
            )}
          </td>
          <td>{store.address || "—"}</td>
          <td>
            <button
              className="accept-btn"
              onClick={() => handleStoreAction(store, "approve")}
            >
              Approve
            </button>

            <button
              className="decline-btn"
              onClick={() => handleStoreAction(store, "reject")}
              style={{ marginLeft: "10px" }}
            >
              Reject
            </button>
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>

<p style={{ marginTop: "22px", color: "#94a3b8", fontSize: "15px" }}>
  All Shops ({stores.length})
</p>

<table className="shipment-table">
  <thead>
    <tr>
      <th>Shop Name</th>
      <th>Category</th>
      <th>Owner</th>
      <th>Status</th>
      <th>Action</th>
    </tr>
  </thead>

  <tbody>
    {stores.map((store) => (
      <tr key={store._id}>
        <td>{store.name}</td>
        <td>{store.category}</td>
        <td>{store.owner ? store.owner.name : "—"}</td>
        <td>
          <span
            className={`status-badge ${store.status}`}
          >
            {store.status}
          </span>
        </td>
        <td>
          {store.status !== "approved" ? (
            <button
              className="accept-btn"
              onClick={() => handleStoreAction(store, "approve")}
            >
              Approve
            </button>
          ) : (
            <button
              className="decline-btn"
              onClick={() => handleStoreAction(store, "reject")}
            >
              Unlist
            </button>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>
</motion.div>

    </div>
   </div> 
  );
}

export default Admin;