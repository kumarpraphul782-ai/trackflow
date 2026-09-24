import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaStore,
  FaUtensils,
  FaCoffee,
  FaShoppingBasket,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaClock,
  FaStar,
} from "react-icons/fa";
import API_URL from "../config";
import "./Marketplace.css";

const CATEGORIES = [
  { key: "all", label: "All", icon: FaStore },
  { key: "restaurant", label: "Restaurants", icon: FaUtensils },
  { key: "cafe", label: "Cafes", icon: FaCoffee },
  { key: "grocery", label: "Grocery", icon: FaShoppingBasket },
];

const CATEGORY_ICON = {
  restaurant: <FaUtensils />,
  cafe: <FaCoffee />,
  grocery: <FaShoppingBasket />,
  other: <FaStore />,
};

const CATEGORY_LABEL = {
  restaurant: "Restaurant",
  cafe: "Cafe",
  grocery: "Grocery",
  other: "Store",
};

function Marketplace() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  const fetchStores = async (currentCategory) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/stores?category=${currentCategory}`
      );
      const data = await res.json();
      if (res.ok) setStores(data);
    } catch (err) {
      console.error(err);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    // Only customers can order food & groceries
    if (!localStorage.getItem("token") || role !== "customer") {
      navigate("/login");
      return;
    }
    setAuthed(true);
  }, [navigate]);

  useEffect(() => {
    fetchStores(category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  if (!authed) return null;

  return (
    <div className="marketplace-page">
      <header className="marketplace-header">
        <motion.button
          className="marketplace-back"
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowLeft />
        </motion.button>
        <div className="marketplace-title-wrap">
          <FaShoppingBasket className="marketplace-logo" />
          <div>
            <h1>Order Food &amp; Groceries</h1>
            <p>Pick a store and explore what they have.</p>
          </div>
        </div>
      </header>

      <div className="category-tabs">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const active = category === cat.key;
          return (
            <motion.button
              key={cat.key}
              className={`category-tab ${active ? "active" : ""}`}
              onClick={() => setCategory(cat.key)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon />
              <span>{cat.label}</span>
            </motion.button>
          );
        })}
      </div>

      <main className="store-grid-wrap">
        <div className="store-query-info">
          <h2>
            {category === "all"
              ? "All Stores"
              : `${CATEGORY_LABEL[category]}s Near You`}
          </h2>
        </div>

        {loading ? (
          <div className="marketplace-loading">Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="marketplace-empty">
            <FaStore className="empty-icon" />
            <h3>No {category === "all" ? "stores" : "stores"} available yet</h3>
            <p>
              Stores you can see here once approved. Own a shop?{" "}
              <span className="empty-link" onClick={() => navigate("/signup")}>
                List it now
              </span>
            </p>
          </div>
        ) : (
          <div className="store-grid">
            {stores.map((store, i) => (
              <motion.div
                key={store._id}
                className="store-card"
                onClick={() => navigate(`/marketplace/store/${store._id}`)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -8, boxShadow: "0 20px 50px rgba(76,201,255,0.2)" }}
              >
                <div className={`store-card-banner cat-${store.category}`}>
                  <div className="store-card-icon">
                    {CATEGORY_ICON[store.category]}
                  </div>
                  <div
                    className={`store-open ${store.isOpen ? "open" : "closed"}`}
                  >
                    {store.isOpen ? "Open" : "Closed"}
                  </div>
                </div>

                <div className="store-card-body">
                  <h3>{store.name}</h3>
                  <div className="store-meta">
                    <span className="store-badge">{CATEGORY_LABEL[store.category]}</span>
                    {store.rating > 0 && (
                      <span className="store-rating">
                        <FaStar /> {Number(store.rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="store-address">
                    <FaMapMarkerAlt /> {store.address || "Address not provided"}
                  </p>
                  <div className="store-footer">
                    <span className="store-time">
                      <FaClock /> {store.deliveryTime}
                    </span>
                    <motion.span
                      className="store-view"
                      whileHover={{ x: 3 }}
                    >
                      View Store →
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Marketplace;