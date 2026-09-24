# TrackFlow Web App

React + Vite frontend for TrackFlow (logistics tracking + store ordering).

## Getting Started

```bash
npm install
cp .env.example .env   # VITE_API_URL points to the backend (default http://localhost:5001)
npm run dev            # http://localhost:5173
```

## Structure

- `src/pages/` — route-level pages (Login, CustomerDashboard, StoreDashboard, DeliveryDashboard, AdminPage, Marketplace, StorePage, LandingPage…)
- `src/components/` — reusable UI (Sidebar, MyOrders, ShipmentRequest, TrackShipment, Profile, Addresses…)
- `src/config.js` — API base URL from env
- `src/socket.js` — Socket.io client for realtime events

See the root [README](../README.md) for full setup, roles and test accounts.