# ECM3432DA — Places map app

Full-stack app for discovering places on a map, submitting new spots (pending admin approval), rating them anonymously by browser, leaving comments when logged in, and an admin workflow to approve or delete submissions.

## Prerequisites

Before you run the project, install and have available:

| Requirement | Notes |
|-------------|--------|
| **Node.js** | **v18.x or newer** (LTS recommended). Includes `npm`. Check with `node -v`. |
| **MongoDB** | A running instance you can connect to: **MongoDB Community** locally, **Docker**, or **MongoDB Atlas**. You need a connection string for `MONGO_URI`. |
| **Git** (optional) | Only if you are cloning the repository. |

No separate global install of Vite or nodemon is required; they come from each package’s `npm install`.

## Tech stack

- **Frontend:** React 19, React Router, Vite, Tailwind CSS v4, Leaflet / React-Leaflet (map & clustering)
- **Backend:** Express 5, Mongoose, JWT auth, bcrypt password hashing

## Environment variables (backend)

Create a file **`backend/.env`** (never commit real secrets) with:

```env
MONGO_URI=mongodb://127.0.0.1:27017/your-db-name
JWT_SECRET=use-a-long-random-string-in-production
PORT=5000
```

- **`MONGO_URI`** — Required. Full MongoDB connection URL (Atlas includes user, password, and cluster host).
- **`JWT_SECRET`** — Required for signing and verifying login tokens.
- **`PORT`** — Optional. Defaults to **5000** if omitted. The Vite dev server proxies `/api` to this port.

## Project layout

```
ECM3432DA/
├── backend/          # Express API + Mongoose models
├── frontend/         # Vite + React client
└── README.md
```

## Setup and run

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env` as described above, ensure MongoDB is reachable, then:

```bash
npm start
```

The API listens on the configured `PORT` (default **5000**). You should see a MongoDB connected message in the terminal.

### 2. Frontend

In a **second** terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**). Requests to `/api` are **proxied** to `http://localhost:5000`, so keep the backend running while developing.

### 3. Production build (frontend only)

```bash
cd frontend
npm run build
npm run preview   # optional: serve the built files locally
```

Serve the `frontend/dist` folder with any static host; configure that host or the frontend so API calls reach your deployed backend (the dev proxy does not apply in production).

## Admin access

New users get `isAdmin: false` by default. To use **Admin** (approve or delete pending places), set **`isAdmin: true`** on a user document in MongoDB (e.g. Compass, `mongosh`, or Atlas UI), then log in again so the client picks up the flag.

## Scripts reference

| Location | Command | Purpose |
|----------|---------|---------|
| `backend` | `npm start` | Run API with nodemon (auto-restart on file changes) |
| `frontend` | `npm run dev` | Vite dev server with hot reload |
| `frontend` | `npm run build` | Production build to `dist/` |
| `frontend` | `npm run lint` | ESLint |

## Licence

ISC (backend `package.json`). Adjust if your module uses a different licence.
