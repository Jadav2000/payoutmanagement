# Payout Management MVP

Interview-ready MERN MVP with JWT auth, RBAC, vendor management, payout workflow, and audit trail.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT, role-based access control (OPS / FINANCE)
- Frontend: React (Vite), Tailwind CSS

## Project Structure

- `backend` - REST API, MongoDB models, seed script
- `my-project` - React frontend

## Backend Setup

1. Go to backend:
   - `cd backend`
2. Create env file:
   - `copy .env.example .env`
3. Install dependencies:
   - `npm install`
4. Seed users:
   - `npm run seed`
5. Start API:
   - `npm run dev`

Backend runs on `http://localhost:5000` by default.

Required backend env variables:

- `MONGO_URI`
- `JWT_SECRET`
- `PORT` (optional, default `5000`)

## Frontend Setup

1. Go to frontend:
   - `cd my-project`
2. Create env file:
   - `copy .env.example .env`
3. Install dependencies:
   - `npm install`
4. Start app:
   - `npm run dev`

Frontend runs on Vite default (`http://localhost:5173`).

## Seeded Users

- `ops@demo.com` / `ops123` (role: `OPS`)
- `finance@demo.com` / `fin123` (role: `FINANCE`)

## API Overview

### Auth

- `POST /api/auth/login`

### Vendors

- `GET /api/vendors` (OPS, FINANCE)
- `POST /api/vendors` (OPS only)

Vendor fields:

- `name` (required), `upi_id`, `bank_account`, `ifsc`, `is_active`

### Payouts

- `GET /api/payouts`
- `POST /api/payouts` (OPS creates Draft)
- `GET /api/payouts/:id`
- `POST /api/payouts/:id/submit` (OPS only, Draft -> Submitted)
- `POST /api/payouts/:id/approve` (FINANCE only, Submitted -> Approved)
- `POST /api/payouts/:id/reject` (FINANCE only, Submitted -> Rejected, `decision_reason` required)

Payout fields:

- `vendor_id`, `amount`, `mode` (`UPI|IMPS|NEFT`), `note`
- `status` (`Draft|Submitted|Approved|Rejected`)
- `decision_reason` (required for rejection)

## Workflow Rules

- OPS can create payout drafts and submit drafts.
- FINANCE can approve or reject submitted payouts.
- Invalid transitions are blocked via API validation.
- Every payout action is logged in `payout_audits` with actor and timestamp.

## Frontend Features

- Login page
- Vendor list + add vendor form (OPS-only form)
- Payout list with filters (`status`, `vendor`)
- Payout creation form (OPS-only)
- Payout detail page with role-aware action buttons
- Audit trail visible in payout detail
- Loading and error states across pages
