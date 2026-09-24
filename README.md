# 🚚 TrackFlow — Logistics Tracking + Store Ordering Platform

A full-stack platform combining **parcel/shipment logistics** with a **Zomato/Blinkit-style store marketplace**. Four roles work together in one app: **Customer**, **Admin (logistics + store approval)**, **Store Owner**, and **Delivery Partner** — all connected in real time.

> ⚠️ **Note on payments:** Online payment is currently a **demo/simulation only** — no real money is charged.

---

## ✨ Features

### 📦 Logistics (Parcel Tracking)
- Customer submits a shipment request (parcel details + receiver info)
- Admin accepts → creates shipment + tracking ID (`TRK...`) and a delivery request
- Delivery partners see open requests and **first-to-accept wins**
- OTP-based **pickup** and **delivery** verification (OTP sent to customer email)
- Live tracking with full status history (`Pending → Picked Up → Out for Delivery → Delivered`)
- Customer dashboard shows assigned admin & delivery partner

### 🛒 Marketplace (Store Ordering)
- Live stores with products; customer carts per store (persisted in `localStorage`)
- 2-step checkout: delivery details → payment (Cash / demo Online)
- Store owner **confirms or rejects** incoming orders — only the owning store can
- Confirmed orders become delivery requests visible to **all partners** (first accept wins)
- Customer sees the assigned delivery partner live on their order
- Realtime updates (new orders, confirmations, deliveries) via **Socket.io**

### 👥 Roles & Auth
- JWT-based auth with email OTP verification
- Role-based dashboards: `customer`, `admin`, `store`, `delivery`
- Admin approves store listings before they go live

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Framer Motion, Socket.io-client, Leaflet |
| Backend | Node.js, Express, Socket.io |
| Database | MongoDB (Mongoose) |
| Auth & Email | JSON Web Tokens, bcryptjs, Nodemailer (OTP emails) |

---

## 📁 Project Structure

```
logistics-tracking/
├── backend/                 # Express API
│   ├── middleware/          # JWT auth middleware
│   ├── models/              # Mongoose schemas (User, Shipment, Store, Order…)
│   ├── routes/              # auth, shipments, requests, marketplace, users, notifications
│   ├── utils/               # Email OTP helpers
│   ├── seed.js              # Database seed script
│   ├── server.js            # App entry point
│   └── package.json
└── frontend/                # React (Vite) app
    ├── public/
    └── src/
        ├── assets/
        ├── components/      # Sidebar, MyOrders, ShipmentRequest, Profile…
        ├── pages/           # Landing, Login, Admin, Customer, Delivery, Store dashboards…
        ├── App.jsx          # Routes
        ├── config.js        # Env-based API config
        ├── socket.js        # Socket.io client
        └── main.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** — a local instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- An **email account** with an app password (for OTP emails, e.g. Gmail)

### 1️⃣ Backend
```bash
cd backend
npm install
cp .env.example .env      # then fill in real values
npm run dev                # starts on http://localhost:5001
```

`.env` variables:
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign auth tokens |
| `EMAIL_USER` | Email address that sends OTPs |
| `EMAIL_PASS` | App password for that email |

### 2️⃣ Frontend
```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL default is http://localhost:5001
npm run dev                # starts on http://localhost:5173
```

Or from the root:
```bash
npm run dev:backend
npm run dev:frontend
```

### 3️⃣ Optional: Seed data
```bash
cd backend
node seed.js               # adds demo users/stores
```

---

## 🔑 Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@trackflow.app` | `Admin@123` |
| Customer | `customer@trackflow.app` | `Customer@123` |
| Delivery Partner | `delivery@trackflow.app` | `Delivery@123` |

---

## 🔌 API Overview

| Group | Endpoints |
|---|---|
| Auth | `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/verify-email-otp` |
| Shipments | `GET/POST /api/shipments`, `GET /api/shipments/:trackingId`, `PUT /api/shipments/:trackingId`, OTP generate/verify |
| Requests | `POST /api/shipment-request`, `PUT /api/shipment-request/:id/accept|decline`, `PUT /api/delivery-request/:id/accept`, `GET /api/my-deliveries/:deliveryBoyId` |
| Marketplace | `GET /api/stores`, `POST /api/stores`, `PUT /api/stores/:id/approve|reject`, `GET|POST /api/orders`, `PUT /api/orders/:id/confirm|reject|delivered`, delivery-request accept |
| Users | `GET/PUT /api/users/...` (profile, addresses) |
| Notifications | `GET /api/notifications/...`, `PUT /api/notifications/read/:userId` |

Realtime events: `new-request`, `shipment-accepted`, `shipment-status-updated`, `new-marketplace-order`, `new-marketplace-delivery-request`, `marketplace-order-updated`, and more.

---

## 📜 Scripts

| Command | Action |
|---|---|
| `npm run dev:backend` | Start backend (auto-restart on change) |
| `npm run dev:frontend` | Start frontend dev server |
| `npm run build` | Production build of frontend |
| `npm run lint` | Lint frontend |

---

## 🧪 Testing
The API has been smoke-tested end-to-end for both flows (logistics: request → accept → OTP pickup → OTP delivery; marketplace: order → store confirm → partner accept → delivered).

---

Built with ❤️ as a full-stack learning project.