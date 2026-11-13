# Reusable RSVP Backend & Monitoring Dashboard

A standalone, production-ready RSVP REST API backend built with Node.js, Express, and MongoDB Atlas. Easily reusable across any wedding or event website that needs an RSVP system.

Includes:
- **Interactive Setup Wizard**: Asks for MongoDB Atlas credentials, tests the connection live, sets admin password, and generates `.env`.
- **Public RSVP API**: Input validation, bot honeypot filtering, and rate-limiting.
- **Admin Authentication**: Secure bcrypt password hashing and JWT token authentication.
- **Monitoring Website**: A standalone, zero-dependency single-file frontend (`dashboard.html`) to monitor live replies, attendance stats, and headcount in real-time.
- **CSV Export**: Clean download for Excel with formula-injection protection and UTF-8 support for non-English names.

---

## 📁 Folder Structure

```
rsvp-backend/
├── src/
│   ├── config/
│   │   └── db.js               # MongoDB Atlas connection handler
│   ├── middleware/
│   │   ├── auth.js             # JWT verification for admin routes
│   │   └── rateLimiter.js      # Rate limiters for public RSVP & admin login
│   ├── models/
│   │   └── Rsvp.js             # Mongoose RSVP schema
│   ├── routes/
│   │   ├── rsvp.js             # Public POST /api/rsvp
│   │   └── admin.js            # Admin stats, rsvps list, delete, and CSV export
│   └── server.js               # Express application entrypoint
├── scripts/
│   └── setup.js                # Guided setup wizard (npm run setup)
├── monitoring/
│   └── dashboard.html          # Standalone frontend monitoring dashboard
├── dashboard.html              # Copy for 1-click opening in browser
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Quick Start (Local Setup)

### 1. Install dependencies
```bash
npm install
```

### 2. Run the interactive setup wizard
```bash
npm run setup
```
The wizard will prompt you for:
1. **MongoDB Atlas URI** (paste your connection string or enter username/password/cluster step-by-step).
2. The wizard automatically **tests your connection live**.
3. **Admin Dashboard Password** (for unlocking the monitoring website).
4. **Allowed Frontend Origins** (or `*` to allow any website to send RSVPs).
5. Writes your secure `.env` file automatically.

### 3. Start the server
```bash
npm start
# or for auto-reloading during development:
npm run dev
```
Your backend will run on **http://localhost:5000**.

---

## 📊 Monitoring Dashboard (Frontend-Only)

You do **not** need to install or build anything to use the monitoring dashboard!

Simply **double-click** `dashboard.html` in your file explorer, or open it in your browser:
- File path: `rsvp-backend/dashboard.html`
- Or via server: `http://localhost:5000/monitoring/dashboard.html`

### Features:
- **Live KPI Cards**: Real-time total headcount, attending count, declining count, and acceptance rate.
- **Search & Filters**: Search guest names and messages; filter by Attending / Declined.
- **Duplicate Warnings**: Automatically flags repeated names so you can spot duplicate submissions.
- **Delete Entries**: Remove test or accidental duplicate submissions with 1 click.
- **1-Click CSV Export**: Download the full list for Microsoft Excel or Google Sheets.
- **Configurable Server Address**: Change the backend URL anytime (useful when switching between localhost and production).

---

## 🌐 API Reference

### Public Endpoints

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `GET` | `/api/health` | Health check & database connection status | None |
| `POST` | `/api/rsvp` | Submit an RSVP | JSON: `{ name, attending, guests, message?, website? }` |

#### POST `/api/rsvp` Request Body:
```json
{
  "name": "Aravind Menon",
  "attending": true,
  "guests": 2,
  "message": "Can't wait to celebrate with you both!",
  "website": ""
}
```
> **Bot Protection Note:** The `website` field is a honeypot. Keep it visually hidden (`display: none`) on your website. If a bot fills it in, the server silently drops the submission without saving spam.

---

### Admin Endpoints (Require Bearer Token)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/admin/login` | Public (Rate-limited) | Send `{ "password": "..." }` to receive a JWT token |
| `GET` | `/api/admin/stats` | Admin | Get total replies, headcount sum, attending count |
| `GET` | `/api/admin/rsvps` | Admin | Get list of responses with `search` and `status` query params |
| `DELETE` | `/api/admin/rsvps/:id`| Admin | Delete an RSVP entry |
| `GET` | `/api/admin/export.csv`| Admin | Download CSV file for Excel |

---

## ☁️ Deploying to Production (Render / Railway)

1. Push this `rsvp-backend` directory to your GitHub repository.
2. In **Render** or **Railway**:
   - Create a **Web Service**.
   - Root directory: `rsvp-backend` (or root if repository contains only the backend).
   - Build command: `npm install`
   - Start command: `npm start`
3. Add the following **Environment Variables**:
   - `PORT`: `5000` (or host provided)
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `ADMIN_PASSWORD_HASH`: The bcrypt hash generated during `npm run setup`
   - `JWT_SECRET`: A long random secret string
   - `ALLOWED_ORIGINS`: Your frontend website URL(s) (e.g. `https://my-wedding.vercel.app` or `*`)
4. In your frontend website(s), configure:
   ```env
   NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
   ```

