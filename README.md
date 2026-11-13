# Anusmithin & Vijithra · Wedding Invitation & RSVP Platform

Full-stack wedding invitation, RSVP confirmation system, and real-time monitoring dashboard for the wedding of **Anusmithin & Vijithra** (13 December 2026, Palakkad).

---

## Project Structure

```
├── frontend/     # Next.js interactive wedding invitation website (Port 3000)
├── dashboard/    # Next.js real-time admin monitoring dashboard (Port 3001)
├── backend/      # Express.js REST API with MongoDB Atlas & Rate Limiting (Port 5000)
└── package.json  # Root helper scripts to run services
```

---

## 1. Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster URI

### Installation
Install dependencies in each workspace:
```bash
# Backend
cd backend && npm install

# Frontend Invitation
cd ../frontend && npm install

# Dashboard
cd ../dashboard && npm install
```

---

## 2. Running Locally

You can run each service independently or use the root commands:

```bash
# Start Backend API (http://localhost:5000)
npm run dev:backend

# Start Frontend Invitation (http://localhost:3000)
npm run dev:frontend

# Start Admin Dashboard (http://localhost:3001)
npm run dev:dashboard
```

---

## 3. Environment Configuration

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/anuwedding?retryWrites=true&w=majority
ADMIN_PASSWORD_HASH=<bcrypt_hash>
JWT_SECRET=<secret>
ALLOWED_ORIGINS=*
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Dashboard (`dashboard/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 4. Key Features

- **Interactive Wedding Invitation**: Animated intro gate with wax seal, muhurtham countdown, event schedule, Google Maps & Calendar integration.
- **RSVP Attendance Dialog**: Full name input, attending/declined selection, number of attendees counter (1-10 with stepper), optional warm wishes, and bot honeypot protection.
- **Admin Dashboard**: Live attendee headcount, responses over time area chart, attendance distribution donut chart, searchable & filterable table/cards with duplicate detection, and 1-click CSV export.
- **Mobile & Desktop Responsive**: Fully optimized with touch gestures, sliding drawers, and adaptive cards for smartphones, tablets, and PCs.

