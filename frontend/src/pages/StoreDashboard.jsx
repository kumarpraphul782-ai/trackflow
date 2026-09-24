import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import socket from "../socket";
import {
  FaStore,
  FaUtensils,
  FaCoffee,
  FaShoppingBasket,
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaPowerOff,
  FaStoreAlt,
  FaCheck,
  FaTimes,
  FaFileInvoice,
} from "react-icons/fa";
import API_URL from "../config";
import "./StoreDashboard.css";

const CATEGORY_ICON = {
  restaurant: <FaUtensils />,
  cafe: <FaCoffee />,
  grocery: <FaShoppingBasket />,
  other: <FaStore />,
};

const STATUS_LABEL = {
  pending: "Pending Approval",
  approved: "Live on TrackFlow",
  rejected: "Rejected — edit & resubmit",
};

function StoreDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token") || "";

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [storeForm, setStoreForm] = useState({
    name: "",
    category: "restaurant",
    description: "",
    address: "",
    phone: "",
    deliveryTime: "20-30 min",
  });

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    category: "",
    unit: "",
    description: "",
  });

  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    if (!store) return;
    try {
      const res = await fetch(`${API_URL}/api/orders/store/${store._id}`);
      const data = await res.json();
      if (res.ok) setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!store) return;
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  useEffect(() => {
    socket.on("new-marketplace-order", () => {
      toast.info("🛒 New order received!");
      fetchOrders();
    });
    socket.on("marketplace-order-updated", () => {
      fetchOrders();
    });
    return () => {
      socket.off("new-marketplace-order");
      socket.off("marketplace-order-updated");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  const getTokenHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const fetchStoreAndProducts = async () => {
    if (!user._id) {
      setLoading(false);
      return;
    }
    try {
      const storeRes = await fetch(`${API_URL}/api/stores/owner/${user._id}`);
      const storeData = await storeRes.json();
      if (storeRes.ok && storeData) {
        setStore(storeData);
        const prodRes = await fetch(
          `${API_URL}/api/stores/${storeData._id}/products`
        );
        const prodData = await prodRes.json();
        if (prodRes.ok) setProducts(prodData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    if (user.role !== "store") {
      navigate("/");
      return;
    }
    fetchStoreAndProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (store) {
      setStoreForm({
        name: store.name || "",
        category: store.category || "restaurant",
        description: store.description || "",
        address: store.address || "",
        phone: store.phone || "",
        deliveryTime: store.deliveryTime || "20-30 min",
      });
    }
  }, [store]);

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!storeForm.name.trim()) {
      toast.error("Shop name is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/stores`, {
        method: "POST",
        headers: getTokenHeaders(),
        body: JSON.stringify(storeForm),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return;
      }
      toast.success("Shop submitted for approval!");
      await fetchStoreAndProducts();
    } catch (err) {
      toast.error("Failed to submit shop");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStore = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/stores/${store._id}`, {
        method: "PUT",
        headers: getTokenHeaders(),
        body: JSON.stringify({
          name: storeForm.name,
          category: storeForm.category,
          description: storeForm.description,
          address: storeForm.address,
          phone: storeForm.phone,
          deliveryTime: storeForm.deliveryTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return;
      }
      toast.success("Shop updated" + (store.status === "rejected" ? " & resubmitted for approval" : ""));
      await fetchStoreAndProducts();
    } catch (err) {
      toast.error("Failed to update shop");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price) {
      toast.error("Product name and price are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/stores/${store._id}/products`, {
        method: "POST",
        headers: getTokenHeaders(),
        body: JSON.stringify(productForm),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return;
      }
      toast.success("Product added!");
      setProductForm({ name: "", price: "", category: "", unit: "", description: "" });
      await fetchStoreAndProducts();
    } catch (err) {
      toast.error("Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async (product) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${product._id}`, {
        method: "PUT",
        headers: getTokenHeaders(),
        body: JSON.stringify({ isAvailable: !product.isAvailable }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return;
      }
      toast.success(data.message);
      await fetchStoreAndProducts();
    } catch (err) {
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${product._id}`, {
        method: "DELETE",
        headers: getTokenHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return;
      }
      toast.success("Product deleted");
      await fetchStoreAndProducts();
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  const handleConfirmOrder = async (order) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${order._id}/confirm`, {
        method: "PUT",
        headers: getTokenHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return;
      }
      toast.success("Order confirmed! A delivery partner will be assigned.");
      fetchOrders();
    } catch (err) {
      toast.error("Failed to confirm order");
    }
  };

  const handleRejectOrder = async (order) => {
    if (!window.confirm(`Reject order ${order.orderId}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/orders/${order._id}/reject`, {
        method: "PUT",
        headers: getTokenHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return;
      }
      toast.success("Order rejected");
      fetchOrders();
    } catch (err) {
      toast.error("Failed to reject order");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="store-dash-page">
        <div className="marketplace-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="store-dash-page">
      <header className="store-dash-header">
        <motion.button
          className="marketplace-back"
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowLeft />
        </motion.button>
        <div className="store-dash-title">
          <FaStoreAlt className="store-dash-logo" />
          <div>
            <h1>Store Dashboard</h1>
            <p>Welcome back, {user.name}</p>
          </div>
        </div>
        <motion.button
          className="store-dash-logout"
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPowerOff /> Logout
        </motion.button>
      </header>

      <main className="store-dash-main">
        {!store ? (
          <motion.section
            className="store-form-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="form-card-icon">
              <FaStore />
            </div>
            <h2>List Your Shop</h2>
            <p>
              Fill in your shop details and submit. Our team reviews every
              listing before it goes live for customers.
            </p>

            <form className="store-form" onSubmit={handleCreateStore}>
              <input
                type="text"
                placeholder="Shop Name *"
                value={storeForm.name}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, name: e.target.value })
                }
                required
              />
              <select
                value={storeForm.category}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, category: e.target.value })
                }
              >
                <option value="restaurant">Restaurant</option>
                <option value="cafe">Cafe</option>
                <option value="grocery">Grocery Store</option>
                <option value="other">Other</option>
              </select>
              <textarea
                placeholder="Short description"
                rows="3"
                value={storeForm.description}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, description: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Shop address"
                value={storeForm.address}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, address: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Contact number"
                value={storeForm.phone}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, phone: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Delivery time (e.g. 20-30 min)"
                value={storeForm.deliveryTime}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, deliveryTime: e.target.value })
                }
              />
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {submitting ? "Submitting..." : "Submit for Approval"}
              </motion.button>
            </form>
          </motion.section>
        ) : (
          <>
            <section className="store-dash-status">
              <div className="store-dash-status-left">
                <div className={`store-dash-icon cat-${store.category}`}>
                  {CATEGORY_ICON[store.category]}
                </div>
                <div>
                  <h2>{store.name}</h2>
                  <p>
                    {store.category.charAt(0).toUpperCase() +
                      store.category.slice(1)}
                    {"  ·  "}
                    {store.deliveryTime}
                    {"  ·  "}
                    {store.isOpen ? "Open" : "Closed"}
                  </p>
                </div>
              </div>
              <span className={`store-status-badge ${store.status}`}>
                {STATUS_LABEL[store.status]}
              </span>
            </section>

            {store.status === "approved" && (
              <div className="store-live-banner">
                Your shop is live! Customers can now find it in the
                marketplace.{" "}
                <span
                  className="live-link"
                  onClick={() => navigate(`/marketplace/store/${store._id}`)}
                >
                  View your store →
                </span>
              </div>
            )}

            <div className="store-dash-grid">
              <motion.section
                className="store-form-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2>Edit Shop Details</h2>
                <form className="store-form" onSubmit={handleUpdateStore}>
                  <input
                    type="text"
                    placeholder="Shop Name *"
                    value={storeForm.name}
                    onChange={(e) =>
                      setStoreForm({ ...storeForm, name: e.target.value })
                    }
                    required
                  />
                  <select
                    value={storeForm.category}
                    onChange={(e) =>
                      setStoreForm({ ...storeForm, category: e.target.value })
                    }
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Cafe</option>
                    <option value="grocery">Grocery Store</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea
                    placeholder="Short description"
                    rows="3"
                    value={storeForm.description}
                    onChange={(e) =>
                      setStoreForm({ ...storeForm, description: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Shop address"
                    value={storeForm.address}
                    onChange={(e) =>
                      setStoreForm({ ...storeForm, address: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Contact number"
                    value={storeForm.phone}
                    onChange={(e) =>
                      setStoreForm({ ...storeForm, phone: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Delivery time"
                    value={storeForm.deliveryTime}
                    onChange={(e) =>
                      setStoreForm({ ...storeForm, deliveryTime: e.target.value })
                    }
                  />
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {submitting
                      ? "Saving..."
                      : store.status === "rejected"
                      ? "Update & Resubmit"
                      : "Save Changes"}
                  </motion.button>
                </form>
              </motion.section>

              <motion.section
                className="store-form-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2>
                  <FaPlus className="section-plus" /> Add Product
                </h2>
                <form className="store-form" onSubmit={handleAddProduct}>
                  <input
                    type="text"
                    placeholder="Product name *"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price (₹) *"
                    min="0"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Category (e.g. Biryani, Dairy)"
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({ ...productForm, category: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Unit (e.g. 1 plate, 500 g)"
                    value={productForm.unit}
                    onChange={(e) =>
                      setProductForm({ ...productForm, unit: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Short description"
                    rows="2"
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                  />
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {submitting ? "Adding..." : "Add Product"}
                  </motion.button>
                </form>
              </motion.section>
            </div>

            <section className="store-form-card product-list-card">
              <h2>Your Products ({products.length})</h2>
              {products.length === 0 ? (
                <p className="no-products">
                  No products yet. Add your first item above.
                </p>
              ) : (
                <div className="product-list">
                  {products.map((product) => (
                    <div className="product-list-row" key={product._id}>
                      <div className="product-list-info">
                        <h3>{product.name}</h3>
                        <p>
                          ₹{product.price}
                          {product.unit ? ` · ${product.unit}` : ""}
                          {product.category ? ` · ${product.category}` : ""}
                        </p>
                      </div>
                      <div className="product-list-actions">
                        <span
                          className={`product-avail ${
                            product.isAvailable ? "available" : ""
                          }`}
                        >
                          {product.isAvailable ? "Available" : "Unavailable"}
                        </span>
                        <motion.button
                          className="toggle-btn"
                          onClick={() => handleToggleAvailability(product)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {product.isAvailable ? "Mark Unavailable" : "Mark Available"}
                        </motion.button>
                        <motion.button
                          className="delete-btn"
                          onClick={() => handleDeleteProduct(product)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {store.status === "approved" && (
              <section className="store-form-card incoming-orders-card">
                <h2>
                  <FaFileInvoice /> Incoming Orders ({orders.length})
                </h2>

                {orders.length === 0 ? (
                  <p className="no-products">
                    No orders yet. When customers order from your store,
                    they'll show up here.
                  </p>
                ) : (
                  <div className="incoming-orders-list">
                    {orders.map((order) => (
                      <div className="incoming-order" key={order._id}>
                        <div className="incoming-order-head">
                          <div>
                            <h3>{order.orderId}</h3>
                            <p>
                              {order.customer?.name || "Customer"} ·{" "}
                              {order.customer?.phone || ""}
                            </p>
                          </div>
                          <span
                            className={`incoming-order-status ${order.status}`}
                          >
                            {order.status === "pending"
                              ? "New Order"
                              : order.status === "confirmed"
                              ? "Confirmed"
                              : order.status === "out_for_delivery"
                              ? "Out for Delivery"
                              : order.status === "delivered"
                              ? "Delivered"
                              : "Cancelled"}
                          </span>
                        </div>

                        <div className="incoming-order-items">
                          {order.items.map((item) => (
                            <div
                              className="incoming-order-item"
                              key={item.product + item.name}
                            >
                              <span>
                                {item.name} × {item.quantity}
                              </span>
                              <span>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        <p className="incoming-order-address">
                          📍 {order.deliveryAddress}
                        </p>

                        <p className="incoming-order-pay">
                          Payment:{" "}
                          <strong>
                            {order.paymentMethod === "cash"
                              ? "Cash on Delivery"
                              : "Paid Online"}
                          </strong>{" "}
                          · Total{" "}
                          <strong>₹{order.total}</strong>
                          {order.note && ` · Note: "${order.note}"`}
                        </p>

                        {order.status === "pending" && (
                          <div className="incoming-order-actions">
                            <motion.button
                              className="order-confirm-btn"
                              onClick={() => handleConfirmOrder(order)}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <FaCheck /> Confirm Order
                            </motion.button>
                            <motion.button
                              className="order-reject-btn"
                              onClick={() => handleRejectOrder(order)}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <FaTimes /> Reject
                            </motion.button>
                          </div>
                        )}

                        {order.status === "out_for_delivery" &&
                          order.deliveryBoy && (
                            <p className="incoming-order-partner">
                              🚚 Delivering by:{" "}
                              <strong>{order.deliveryBoy.name}</strong> (
                              {order.deliveryBoy.phone})
                            </p>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default StoreDashboard;