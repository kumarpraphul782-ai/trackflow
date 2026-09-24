const express = require("express");
const auth = require("../middleware/auth");
const Store = require("../models/store");
const Product = require("../models/product");
const Notification = require("../models/notification");
const MarketplaceOrder = require("../models/marketplaceOrder");
const MarketplaceDeliveryRequest = require("../models/marketplaceDeliveryRequest");
const User = require("../models/user");

// Marketplace routes: stores & products (food / grocery ordering module)
module.exports = (io) => {
  const router = express.Router();

  // ==================== STORES ====================

  // Public: get approved stores (optionally filter by category)
  router.get("/stores", async (req, res) => {
    try {
      const { category } = req.query;

      const query = { status: "approved" };
      if (category && category !== "all") {
        query.category = category;
      }

      const stores = await Store.find(query)
        .populate("owner", "name email phone")
        .sort({ createdAt: -1 });

      res.status(200).json(stores);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Public: get a single approved store
  router.get("/stores/:id", async (req, res) => {
    try {
      const store = await Store.findOne({
        _id: req.params.id,
        status: "approved",
      }).populate("owner", "name email phone");

      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }

      res.status(200).json(store);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Admin: get all stores (any status), optional ?status=pending filter
  router.get("/admin/stores", async (req, res) => {
    try {
      const { status } = req.query;

      const query = {};
      if (status) query.status = status;

      const stores = await Store.find(query)
        .populate("owner", "name email phone role")
        .sort({ createdAt: -1 });

      res.status(200).json(stores);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Store owner: get their own store (for dashboard)
  router.get("/stores/owner/:ownerId", async (req, res) => {
    try {
      const store = await Store.findOne({ owner: req.params.ownerId }).populate(
        "owner",
        "name email phone"
      );

      res.status(200).json(store);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Store owner: create store listing (starts as pending)
  router.post("/stores", auth, async (req, res) => {
    try {
      if (req.user.role !== "store") {
        return res
          .status(403)
          .json({ message: "Only store accounts can list a shop" });
      }

      const existing = await Store.findOne({ owner: req.user._id });
      if (existing) {
        return res
          .status(400)
          .json({ message: "You already have a shop listing" });
      }

      const {
        name,
        category,
        description,
        address,
        phone,
        deliveryTime,
        image,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: "Shop name is required" });
      }

      const store = await Store.create({
        owner: req.user._id,
        name: name.trim(),
        category: category || "other",
        description: description || "",
        address: address || "",
        phone: phone || "",
        deliveryTime: deliveryTime || "20-30 min",
        image: image || "",
        status: "pending",
      });

      res.status(201).json({ message: "Shop submitted for approval", store });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Store owner: update their own store (resubmits rejected -> pending)
  router.put("/stores/:id", auth, async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }

      if (store.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not your store" });
      }

      const allowed = [
        "name",
        "category",
        "description",
        "address",
        "phone",
        "deliveryTime",
        "image",
        "isOpen",
      ];
      allowed.forEach((field) => {
        if (req.body[field] !== undefined) store[field] = req.body[field];
      });

      // Editing a rejected store sends it back to admin review
      if (store.status === "rejected") store.status = "pending";

      await store.save();

      res.status(200).json({ message: "Store updated", store });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Admin: approve a store listing
  router.put("/stores/:id/approve", auth, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin only" });
      }

      const store = await Store.findByIdAndUpdate(
        req.params.id,
        { status: "approved" },
        { new: true }
      );

      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }

      await Notification.create({
        user: store.owner,
        message: `🎉 Your shop "${store.name}" has been approved and is now live!`,
      });

      io.emit("store-status-updated");

      res.status(200).json({ message: "Store approved", store });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Admin: reject a store listing
  router.put("/stores/:id/reject", auth, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin only" });
      }

      const store = await Store.findByIdAndUpdate(
        req.params.id,
        { status: "rejected" },
        { new: true }
      );

      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }

      await Notification.create({
        user: store.owner,
        message: `Your shop "${store.name}" was rejected. Please update details and resubmit.`,
      });

      io.emit("store-status-updated");

      res.status(200).json({ message: "Store rejected", store });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Store owner: delete their store
  router.delete("/stores/:id", auth, async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }

      if (store.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not your store" });
      }

      await Product.deleteMany({ store: store._id });
      await store.deleteOne();

      res.status(200).json({ message: "Store deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // ==================== PRODUCTS ====================

  // Public: products for a store
  router.get("/stores/:id/products", async (req, res) => {
    try {
      const products = await Product.find({ store: req.params.id }).sort({
        createdAt: -1,
      });

      res.status(200).json(products);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Store owner: add product to their store
  router.post("/stores/:id/products", auth, async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }

      if (store.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not your store" });
      }

      const { name, price, category, unit, description, image } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: "Product name is required" });
      }
      if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
        return res.status(400).json({ message: "Valid price is required" });
      }

      const product = await Product.create({
        store: store._id,
        name: name.trim(),
        price: Number(price),
        category: category || "",
        unit: unit || "",
        description: description || "",
        image: image || "",
      });

      res.status(201).json({ message: "Product added", product });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Store owner: update their product
  router.put("/products/:id", auth, async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const store = await Store.findById(product.store);
      if (!store || store.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not your product" });
      }

      const allowed = [
        "name",
        "price",
        "category",
        "unit",
        "description",
        "image",
        "isAvailable",
      ];
      allowed.forEach((field) => {
        if (req.body[field] !== undefined) product[field] = req.body[field];
      });

      await product.save();

      res.status(200).json({ message: "Product updated", product });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Store owner: delete their product
  router.delete("/products/:id", auth, async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const store = await Store.findById(product.store);
      if (!store || store.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not your product" });
      }

      await product.deleteOne();

      res.status(200).json({ message: "Product deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // ==================== ORDERS ====================

  // Customer: place an order for a store (from their cart)
  router.post("/orders", auth, async (req, res) => {
    try {
      if (req.user.role !== "customer") {
        return res
          .status(403)
          .json({ message: "Only customer accounts can place orders" });
      }

      const {
        storeId,
        items,
        deliveryAddress,
        customerPhone,
        note,
        paymentMethod,
      } = req.body;

      if (!storeId) {
        return res.status(400).json({ message: "Store is required" });
      }

      const store = await Store.findOne({
        _id: storeId,
        status: "approved",
      });
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      if (!deliveryAddress || !deliveryAddress.trim()) {
        return res.status(400).json({ message: "Delivery address is required" });
      }

      const deliveryFee = 30;
      let subtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product || product.store.toString() !== store._id.toString()) {
          return res
            .status(400)
            .json({ message: `Product "${item.name}" is not available` });
        }
        if (!product.isAvailable) {
          return res
            .status(400)
            .json({ message: `"${product.name}" is out of stock` });
        }

        const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
        subtotal += product.price * quantity;
        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity,
        });
      }

      const paid = paymentMethod === "online" ? "paid" : "pending";

      const order = await MarketplaceOrder.create({
        store: store._id,
        customer: req.user._id,
        items: orderItems,
        deliveryAddress: deliveryAddress.trim(),
        customerName: req.body.customerName || req.user.name || "",
        customerPhone: customerPhone || req.user.phone || "",
        note: note || "",
        paymentMethod: paymentMethod === "online" ? "online" : "cash",
        paymentStatus: paid,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        status: "pending",
      });

      // Build a unique, readable order id from the Mongo _id (never collides)
      order.orderId = "ORD" + order._id.toString().slice(-8).toUpperCase();
      await order.save();

      await Notification.create({
        user: store.owner,
        message: `🛒 New order "${order.orderId}" received for ${store.name}. Confirm it now!`,
      });
      io.emit("new-marketplace-order");

      res.status(201).json({
        message: "Order placed successfully",
        order,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Customer: get their store orders
  router.get("/orders/customer/:customerId", async (req, res) => {
    try {
      const orders = await MarketplaceOrder.find({
        customer: req.params.customerId,
      })
        .populate("store", "name category")
        .populate("deliveryBoy", "name email phone")
        .sort({ createdAt: -1 });

      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Store owner: get orders for their store
  router.get("/orders/store/:storeId", async (req, res) => {
    try {
      const orders = await MarketplaceOrder.find({
        store: req.params.storeId,
      })
        .populate("customer", "name email phone")
        .populate("deliveryBoy", "name email phone")
        .sort({ createdAt: -1 });

      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Store owner: confirm order -> pushes it to delivery partners
  router.put("/orders/:id/confirm", auth, async (req, res) => {
    try {
      const order = await MarketplaceOrder.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const store = await Store.findById(order.store);
      if (!store || store.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not your store's order" });
      }

      if (order.status !== "pending") {
        return res
          .status(400)
          .json({ message: "This order has already been handled" });
      }

      order.status = "confirmed";
      await order.save();

      await MarketplaceDeliveryRequest.create({ order: order._id });

      await Notification.create({
        user: order.customer,
        message: `✅ "${store.name}" confirmed your order ${order.orderId}. Looking for a delivery partner...`,
      });

      io.emit("marketplace-order-updated");
      io.emit("new-marketplace-delivery-request");

      res.status(200).json({ message: "Order confirmed", order });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Store owner: reject order
  router.put("/orders/:id/reject", auth, async (req, res) => {
    try {
      const order = await MarketplaceOrder.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const store = await Store.findById(order.store);
      if (!store || store.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not your store's order" });
      }

      if (order.status !== "pending") {
        return res
          .status(400)
          .json({ message: "This order has already been handled" });
      }

      order.status = "cancelled";
      await order.save();

      await Notification.create({
        user: order.customer,
        message: `❌ "${store.name}" could not accept your order ${order.orderId}. It has been cancelled.`,
      });

      io.emit("marketplace-order-updated");

      res.status(200).json({ message: "Order rejected", order });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Delivery partner: mark an assigned store order as delivered
  router.put("/orders/:id/delivered", async (req, res) => {
    try {
      const order = await MarketplaceOrder.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      order.status = "delivered";
      if (order.paymentMethod === "cash") order.paymentStatus = "paid";
      await order.save();

      const store = await Store.findById(order.store);

      await Notification.create({
        user: order.customer,
        message: `🎉 Your order ${order.orderId} from "${store.name}" has been delivered. Enjoy!`,
      });
      io.emit("marketplace-order-updated");

      res.status(200).json({ message: "Order marked as delivered", order });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // ============ MARKETPLACE DELIVERY REQUESTS ============

  // Delivery partner: list unassigned store delivery requests
  router.get("/marketplace-delivery-request", async (req, res) => {
    try {
      const requests = await MarketplaceDeliveryRequest.find({
        acceptedByDelivery: null,
      })
        .populate({
          path: "order",
          populate: [
            { path: "store", select: "name category address" },
            { path: "customer", select: "name phone" },
          ],
        })
        .sort({ createdAt: -1 });

      res.status(200).json(requests);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Delivery partner: accept a store order delivery
  router.put("/marketplace-delivery-request/:id/accept", async (req, res) => {
    try {
      const activeOrder = await MarketplaceOrder.findOne({
        deliveryBoy: req.body.deliveryBoyId,
        status: { $nin: ["delivered", "cancelled"] },
      });

      if (activeOrder) {
        return res.status(400).json({
          message: "You already have an active store delivery. Complete it first.",
        });
      }

      const request = await MarketplaceDeliveryRequest.findOneAndUpdate(
        {
          _id: req.params.id,
          acceptedByDelivery: null,
        },
        {
          acceptedByDelivery: req.body.deliveryBoyId,
          status: "Accepted",
        },
        {
          new: true,
        }
      );

      if (!request) {
        return res.status(400).json({
          message: "This delivery has already been accepted.",
        });
      }

      const order = await MarketplaceOrder.findById(request.order);
      order.deliveryBoy = req.body.deliveryBoyId;
      order.status = "out_for_delivery";
      await order.save();

      const deliveryBoy = await User.findById(req.body.deliveryBoyId);

      await Notification.create({
        user: order.customer,
        message: `🚚 ${deliveryBoy.name} is delivering your order ${order.orderId}!`,
      });
      io.emit("marketplace-order-updated");

      await MarketplaceDeliveryRequest.findByIdAndDelete(request._id);

      res.status(200).json({
        message: "Delivery accepted successfully",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Delivery partner: get store deliveries assigned to them
  router.get("/my-marketplace-deliveries/:deliveryBoyId", async (req, res) => {
    try {
      const orders = await MarketplaceOrder.find({
        deliveryBoy: req.params.deliveryBoyId,
      })
        .populate("store", "name category address phone")
        .populate("customer", "name phone")
        .sort({ createdAt: -1 });

      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};