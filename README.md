# Document Portal

## 1. Project Overview

A role-based document management system built as a full-stack assignment submission.

Users authenticate via JWT. After login, access to documents is controlled by role: **ADMIN** can create and delete documents; **USER** has read-only access. Authorization is enforced at the backend middleware layer — not just in the UI.

---

## 2. Tech Stack

**Frontend**
- React 18
- TypeScript
- Vite

**Backend**
- Node.js
- Express
- TypeScript

**Database**
- PostgreSQL via [Neon](https://neon.tech) (serverless)
- `pg` driver — no ORM

**Authentication**
- JWT (`jsonwebtoken`)
- `bcrypt` for password hashing

---

## 3. Folder Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts       # Login logic
│   │   │   └── documentController.ts  # GET, POST, DELETE handlers
│   │   ├── db/
│   │   │   ├── pool.ts                 # pg connection pool
│   │   │   ├── schema.sql              # Table definitions
│   │   │   └── seed.sql                # Test user inserts
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts       # protect + requireRole
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   └── documentRoutes.ts
│   │   ├── types/                      # Backend type definitions
│   │   └── index.ts                    # Express app entry point
│   ├── .env                            # Not committed
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CategoryFilter.tsx      # Category filter pills
    │   │   ├── CreateDocumentForm.tsx  # ADMIN-only create form
    │   │   ├── DocumentList.tsx        # Document cards with expand/delete
    │   │   └── PrivateRoute.tsx        # Redirects unauthenticated users
    │   ├── context/
    │   │   └── AuthContext.tsx         # Auth state, login, logout
    │   ├── pages/
    │   │   ├── LoginPage.tsx
    │   │   └── DashboardPage.tsx
    │   ├── services/
    │   │   ├── api.ts                  # Axios instance with JWT interceptor
    │   │   ├── authService.ts
    │   │   └── documentService.ts
    │   ├── types/                      # Frontend type definitions
    │   ├── App.tsx                     # Route definitions
    │   └── index.css                   # Design system with dark mode support
    ├── .env                            # Not committed
    └── .env.example
```

---

## 4. Neon Database Setup

1. Create a free account at [neon.tech](https://neon.tech) and create a new project.
2. Copy the **Connection string** from the project dashboard.  
   Format: `postgresql://user:password@host/dbname?sslmode=require`
3. Open the **SQL Editor** in the Neon console.
4. Run `backend/src/db/schema.sql` — creates `users` and `documents` tables.
5. Run `backend/src/db/seed.sql` — inserts the two test users.

---

## 5. Environment Variables

### `backend/.env`

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
PORT=5000
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (from Neon) |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs |
| `JWT_EXPIRES_IN` | No | Token lifetime — defaults to `7d` |
| `PORT` | No | Server port — defaults to `5000` |

Generate a secure `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Base URL of the Express API |

---

## 6. Installation & Running

### Backend

```bash
cd backend
npm install
cp .env.example .env      # fill in DATABASE_URL and JWT_SECRET
npm run dev               # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env      # set VITE_API_BASE_URL=http://localhost:5000/api
npm run dev               # starts on http://localhost:5173
```

Both servers must be running simultaneously.

---

## 7. Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@test.com` | `Admin1234!` |
| User | `user@test.com` | `User1234!` |

Passwords are stored as bcrypt hashes (cost factor 10). Plain-text passwords are never persisted.

---

## 8. API Routes Summary

| Method | Endpoint | Auth Required | Role |
|--------|----------|---------------|------|
| `POST` | `/api/auth/login` | No | — |
| `GET` | `/api/health` | No | — |
| `GET` | `/api/documents` | Yes (JWT) | ADMIN, USER |
| `POST` | `/api/documents` | Yes (JWT) | ADMIN only |
| `DELETE` | `/api/documents/:id` | Yes (JWT) | ADMIN only |

**Request body for `POST /api/documents`:**
```json
{ "title": "string", "content": "string", "category": "string" }
```

**Status codes used:**

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Document created |
| `400` | Missing or invalid fields |
| `401` | Missing, invalid, or expired token |
| `403` | Authenticated but insufficient role |
| `404` | Document not found |
| `500` | Internal server error |

---

## 9. RBAC Explanation

Authorization is enforced by two Express middleware functions in `authMiddleware.ts`:

- **`protect`** — extracts the Bearer token from `Authorization` header, verifies the JWT signature and expiry, and attaches the decoded payload to `req.user`. Returns `401` if the token is absent, invalid, or expired.
- **`requireRole(...roles)`** — checks `req.user.role` against the allowed roles. Returns `403` if the role does not match.

Both middleware functions are applied directly on the route definitions:

```
GET  /api/documents  →  protect, requireRole('ADMIN', 'USER')
POST /api/documents  →  protect, requireRole('ADMIN')
DEL  /api/documents  →  protect, requireRole('ADMIN')
```

The frontend conditionally renders the create form and delete buttons based on the user's role. This is a UI convenience only. Any request sent without the required role — regardless of how it is made — will be rejected by the server with a `403` response.

---

## 10. Deployment Notes

**Frontend** — deploy the Vite production build to [Vercel](https://vercel.com) or [Netlify](https://netlify.com):
```bash
cd frontend && npm run build   # outputs to frontend/dist/
```
Set `VITE_API_BASE_URL` to the deployed backend URL in the host's environment settings.

**Backend** — deploy to [Railway](https://railway.app), [Render](https://render.com), or [Fly.io](https://fly.io):
```bash
cd backend && npm run build && npm start
```
Set all environment variables via the host's secrets manager — not in a committed `.env` file.

**Database** — Neon free tier is sufficient for this project. Ensure `sslmode=require` remains in `DATABASE_URL` in production. Update the CORS origin in `backend/src/index.ts` to match the deployed frontend domain.
