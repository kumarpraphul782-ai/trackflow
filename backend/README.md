# TrackFlow API

Express + MongoDB (Mongoose) + Socket.io backend for TrackFlow.

## Run

```bash
npm install
cp .env.example .env   # set MONGO_URI, JWT_SECRET, EMAIL_USER, EMAIL_PASS
npm run dev            # http://localhost:5001
```

## Layout

- `server.js` — entry point, mounts route modules
- `routes/` — auth, shipments, requests, marketplace, users, notifications
- `models/` — Mongoose schemas
- `middleware/auth.js` — JWT guard
- `utils/email.js` — OTP email helper
- `seed.js` — demo data seed

See the root [README](../README.md) for the full API overview.