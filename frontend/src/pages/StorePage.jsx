import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaStore,
  FaUtensils,
  FaCoffee,
  FaShoppingBasket,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaClock,
  FaStar,
  FaPhoneAlt,
  FaPlus,
  FaMinus,
  FaTrash,
  FaMoneyBillWave,
  FaCreditCard,
  FaCheckCircle,
} from "react-icons/fa";
import API_URL from "../config";
import "./Marketplace.css";

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

const DELIVERY_FEE = 30;

function StorePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const cartKey = `cart_${id}`;
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token") || "";

  // Cart in localStorage so it survives a refresh
  const loadCart = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(cartKey) || "[]");
    } catch {
      return [];
    }
  }, [cartKey]);

  const saveCart = useCallback(
    (cart) => localStorage.setItem(cartKey, JSON.stringify(cart)),
    [cartKey]
  );

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState("details");
  const [onlinePaid, setOnlinePaid] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const [details, setDetails] = useState({
    deliveryAddress: "",
    customerName: user.name || "",
    customerPhone: user.phone || "",
    note: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cash");

  useEffect(() => {
    setCart(loadCart());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const storeRes = await fetch(`${API_URL}/api/stores/${id}`);
        const storeData = await storeRes.json();
        if (storeRes.ok) setStore(storeData);

        const productRes = await fetch(`${API_URL}/api/stores/${id}/products`);
        const productData = await productRes.json();
        if (productRes.ok) setProducts(productData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [id]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      const next = existing
        ? prev.map((item) =>
            item.productId === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [
            ...prev,
            {
              productId: product._id,
              name: product.name,
              price: product.price,
              unit: product.unit || "",
              quantity: 1,
            },
          ];
      saveCart(next);
      return next;
    });
    toast.success(`Added ${product.name} to cart`);
  };

  const changeQty = (productId, delta) => {
    setCart((prev) => {
      const next = prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0);
      saveCart(next);
      return next;
    });
  };

  const removeItem = (productId) => {
    setCart((prev) => {
      const next = prev.filter((item) => item.productId !== productId);
      saveCart(next);
      return next;
    });
  };

  const inCartQuantity = (product) =>
    cart.find((item) => item.productId === product._id)?.quantity || 0;

  const openCheckout = () => {
    if (!token) {
      toast.info("Please login to place an order");
      navigate("/login");
      return;
    }
    if ((user.role || "") !== "customer") {
      toast.error("Only customer accounts can place orders");
      return;
    }
    setCheckoutStep("details");
    setOnlinePaid(false);
    setCheckoutOpen(true);
  };

  const placeOrder = async () => {
    if (!details.deliveryAddress.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }
    if (paymentMethod === "online" && !onlinePaid) {
      toast.error("Please complete the online payment first");
      return;
    }

    setPlacing(true);
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeId: id,
          items: cart,
          deliveryAddress: details.deliveryAddress,
          customerName: details.customerName || user.name,
          customerPhone: details.customerPhone || user.phone,
          note: details.note,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return;
      }
      setPlacedOrder(data.order);
      setCart([]);
      saveCart([]);
      setCheckoutStep("success");
    } catch (err) {
      toast.error("Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  // "Pay" is a demo — it just simulates a successful online payment.
  const payOnline = () => {
    setOnlinePaid(true);
    toast.success("Payment successful (demo)");
  };

  const productCategories = [
    "all",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const filteredProducts =
    categoryFilter === "all"
      ? products
      : products.filter((p) => p.category === categoryFilter);

  if (loading) {
    return (
      <div className="marketplace-page store-empty-state">
        <div className="marketplace-loading">Loading store...</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="marketplace-page store-empty-state">
        <div className="marketplace-empty">
          <FaStore className="empty-icon" />
          <h3>Store not found</h3>
          <p>
            This store may have been removed.{" "}
            <span
              className="empty-link"
              onClick={() => navigate("/marketplace")}
            >
              Browse other stores
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-page">
      <header className="marketplace-header">
        <motion.button
          className="marketplace-back"
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowLeft />
        </motion.button>
        <div className="marketplace-title-wrap">
          <FaShoppingBasket className="marketplace-logo" />
          <div>
            <h1>{store.name}</h1>
            <p>{CATEGORY_LABEL[store.category]}</p>
          </div>
        </div>
      </header>

      <section className="store-hero">
        <div className={`store-hero-icon cat-${store.category}`}>
          {CATEGORY_ICON[store.category]}
        </div>
        <div className="store-hero-info">
          <h2>{store.name}</h2>
          <div className="store-meta">
            <span className="store-badge">{CATEGORY_LABEL[store.category]}</span>
            {store.rating > 0 && (
              <span className="store-rating">
                <FaStar /> {Number(store.rating).toFixed(1)}
              </span>
            )}
            <span
              className={`store-open-pill ${store.isOpen ? "open" : "closed"}`}
            >
              {store.isOpen ? "Open" : "Closed"}
            </span>
          </div>
          {store.description && (
            <p className="store-description">{store.description}</p>
          )}
          <div className="store-details">
            {store.address && (
              <span>
                <FaMapMarkerAlt /> {store.address}
              </span>
            )}
            <span>
              <FaClock /> {store.deliveryTime}
            </span>
            {store.phone && (
              <span>
                <FaPhoneAlt /> {store.phone}
              </span>
            )}
          </div>
        </div>
      </section>

      <main className="store-grid-wrap">
        {productCategories.length > 1 && (
          <div className="category-tabs store-product-tabs">
            {productCategories.map((cat) => (
              <motion.button
                key={cat}
                className={`category-tab ${
                  categoryFilter === cat ? "active" : ""
                }`}
                onClick={() => setCategoryFilter(cat)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                {cat === "all" ? "All Items" : cat}
              </motion.button>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="marketplace-empty">
            <FaShoppingBasket className="empty-icon" />
            <h3>No products listed yet</h3>
            <p>Check back soon — this store is adding new items.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product, i) => {
              const qty = inCartQuantity(product);
              return (
                <motion.div
                  key={product._id}
                  className="product-card"
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  whileHover={{ y: -6 }}
                >
                  <div className="product-card-head">
                    <span className="product-emoji">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <FaShoppingBasket />
                      )}
                    </span>
                    {!product.isAvailable && (
                      <span className="product-out">Out of stock</span>
                    )}
                  </div>
                  <div className="product-card-body">
                    <h3>{product.name}</h3>
                    {product.unit && (
                      <p className="product-unit">{product.unit}</p>
                    )}
                    {product.description && (
                      <p className="product-desc">{product.description}</p>
                    )}
                    <div className="product-footer">
                      <span className="product-price">₹{product.price}</span>
                      <span
                        className={`product-avail ${
                          product.isAvailable ? "available" : ""
                        }`}
                      >
                        {product.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </div>
                    {product.isAvailable && (
                      <div className="product-buy-row">
                        {qty === 0 ? (
                          <motion.button
                            className="add-to-cart-btn"
                            onClick={() => addToCart(product)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <FaPlus /> Add to Cart
                          </motion.button>
                        ) : (
                          <div className="qty-stepper">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => changeQty(product._id, -1)}
                            >
                              <FaMinus />
                            </motion.button>
                            <span>{qty}</span>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => changeQty(product._id, 1)}
                            >
                              <FaPlus />
                            </motion.button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {cartCount > 0 && (
        <motion.div
          className="cart-bar"
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="cart-bar-info">
            <span>
              <FaShoppingCart /> {cartCount} item{cartCount > 1 ? "s" : ""}
            </span>
            <strong>₹{cartTotal + DELIVERY_FEE} incl. delivery</strong>
          </div>
          <motion.button
            className="cart-bar-btn"
            onClick={() => setCartOpen(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            View Cart →
          </motion.button>
        </motion.div>
      )}

      <AnimatePresence>
        {cartOpen && (
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          >
            <motion.div
              className="cart-modal"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cart-modal-header">
                <h2>
                  <FaShoppingCart /> Your Cart
                </h2>
                <motion.button
                  className="close-btn"
                  onClick={() => setCartOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>

              {cart.length === 0 ? (
                <p className="cart-empty">Your cart is empty.</p>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map((item) => (
                      <div className="cart-item" key={item.productId}>
                        <div className="cart-item-info">
                          <h3>{item.name}</h3>
                          {item.unit && <p>{item.unit}</p>}
                          <span>₹{item.price}</span>
                        </div>
                        <div className="qty-stepper cart-qty">
                          <button onClick={() => changeQty(item.productId, -1)}>
                            <FaMinus />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => changeQty(item.productId, 1)}>
                            <FaPlus />
                          </button>
                        </div>
                        <strong className="cart-item-total">
                          ₹{item.price * item.quantity}
                        </strong>
                        <button
                          className="cart-item-remove"
                          onClick={() => removeItem(item.productId)}
                          title="Remove"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="cart-totals">
                    <div>
                      <span>Item total</span>
                      <span>₹{cartTotal}</span>
                    </div>
                    <div>
                      <span>Delivery fee</span>
                      <span>₹{DELIVERY_FEE}</span>
                    </div>
                    <div className="cart-grand-total">
                      <span>To Pay</span>
                      <span>₹{cartTotal + DELIVERY_FEE}</span>
                    </div>
                  </div>

                  <motion.button
                    className="checkout-btn"
                    onClick={openCheckout}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Proceed to Checkout →
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checkoutOpen && (
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="cart-modal checkout-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {checkoutStep === "success" && placedOrder ? (
                <div className="order-success">
                  <motion.div
                    className="success-icon"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 15 }}
                  >
                    <FaCheckCircle />
                  </motion.div>
                  <h2>Order Placed!</h2>
                  <p>
                    Order ID: <strong>{placedOrder.orderId}</strong>
                  </p>
                  <p>
                    {placedOrder.paymentMethod === "cash"
                      ? "Pay ₹" +
                        placedOrder.total +
                        " by Cash on Delivery."
                      : "Payment of ₹" +
                        placedOrder.total +
                        " received."}
                  </p>
                  <p className="success-next">
                    The store will confirm your order, and a delivery partner
                    will be assigned — you can see their name & phone in My
                    Orders.
                  </p>
                  <motion.button
                    className="checkout-btn"
                    onClick={() => {
                      setCheckoutOpen(false);
                      navigate("/customer");
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View My Orders
                  </motion.button>
                  <motion.button
                    className="checkout-btn checkout-btn-ghost"
                    onClick={() => setCheckoutOpen(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Keep Shopping
                  </motion.button>
                </div>
              ) : (
                <>
                  <div className="cart-modal-header">
                    <h2>Checkout</h2>
                    <motion.button
                      className="close-btn"
                      onClick={() => setCheckoutOpen(false)}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✕
                    </motion.button>
                  </div>

                  <div className="checkout-steps">
                    <span
                      className={checkoutStep === "details" ? "active" : ""}
                    >
                      Delivery Details
                    </span>
                    <span className={checkoutStep === "pay" ? "active" : ""}>
                      Payment
                    </span>
                  </div>

                  {checkoutStep === "details" && (
                    <div className="checkout-form">
                      <label>
                        Name
                        <input
                          type="text"
                          value={details.customerName}
                          onChange={(e) =>
                            setDetails({
                              ...details,
                              customerName: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Phone
                        <input
                          type="text"
                          value={details.customerPhone}
                          onChange={(e) =>
                            setDetails({
                              ...details,
                              customerPhone: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Delivery Address *
                        <textarea
                          rows="3"
                          placeholder="House no, street, city, pincode"
                          value={details.deliveryAddress}
                          onChange={(e) =>
                            setDetails({
                              ...details,
                              deliveryAddress: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Note for store (optional)
                        <input
                          type="text"
                          placeholder="e.g. ring the doorbell"
                          value={details.note}
                          onChange={(e) =>
                            setDetails({ ...details, note: e.target.value })
                          }
                        />
                      </label>
                      <motion.button
                        className="checkout-btn"
                        disabled={!details.deliveryAddress.trim()}
                        onClick={() => setCheckoutStep("pay")}
                        whileHover={
                          details.deliveryAddress.trim() ? { scale: 1.02 } : {}
                        }
                        whileTap={{ scale: 0.98 }}
                      >
                        Continue to Payment →
                      </motion.button>
                    </div>
                  )}

                  {checkoutStep === "pay" && (
                    <div className="checkout-form">
                      <div className="pay-methods">
                        <div
                          className={`pay-method ${
                            paymentMethod === "cash" ? "active" : ""
                          }`}
                          onClick={() => setPaymentMethod("cash")}
                        >
                          <FaMoneyBillWave />
                          <div>
                            <h3>Cash on Delivery</h3>
                            <p>Pay when your order arrives</p>
                          </div>
                        </div>
                        <div
                          className={`pay-method ${
                            paymentMethod === "online" ? "active" : ""
                          }`}
                          onClick={() => setPaymentMethod("online")}
                        >
                          <FaCreditCard />
                          <div>
                            <h3>Pay Online</h3>
                            <p>UPI / Card (demo)</p>
                          </div>
                        </div>
                      </div>

                      {paymentMethod === "online" && (
                        <div className="pay-online-box">
                          <label>
                            UPI ID / Card number
                            <input type="text" placeholder="demo@upi" />
                          </label>
                          <motion.button
                            className="checkout-btn"
                            disabled={onlinePaid}
                            onClick={payOnline}
                            whileHover={onlinePaid ? {} : { scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {onlinePaid
                              ? "✓ Payment Successful"
                              : `Pay ₹${cartTotal + DELIVERY_FEE}`}
                          </motion.button>
                          {onlinePaid && (
                            <p className="pay-done-note">
                              Payment captured (demo). Confirming order...
                            </p>
                          )}
                        </div>
                      )}

                      <div className="cart-totals">
                        <div>
                          <span>Item total</span>
                          <span>₹{cartTotal}</span>
                        </div>
                        <div>
                          <span>Delivery fee</span>
                          <span>₹{DELIVERY_FEE}</span>
                        </div>
                        <div className="cart-grand-total">
                          <span>To Pay</span>
                          <span>₹{cartTotal + DELIVERY_FEE}</span>
                        </div>
                      </div>

                      <div className="checkout-actions">
                        <motion.button
                          className="checkout-btn checkout-btn-ghost"
                          onClick={() => setCheckoutStep("details")}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          ← Back
                        </motion.button>
                        <motion.button
                          className="checkout-btn"
                          disabled={placing}
                          onClick={placeOrder}
                          whileHover={placing ? {} : { scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {placing
                            ? "Placing Order..."
                            : paymentMethod === "online"
                            ? "Place Order (Paid)"
                            : "Place Order"}
                        </motion.button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default StorePage;