  # Document Portal

  A full-stack document management system with JWT-based authentication and middleware-enforced role-based access control (RBAC).

  **Live**

  | | URL |
  |--|-----|
  | Frontend | [docportal-zeta.vercel.app](https://docportal-zeta.vercel.app/login) |
  | Backend API | [n7ai-assessment.onrender.com](https://n7ai-assessment.onrender.com) |

  ---

  ## Tech Stack

  | Layer | Technology |
  |-------|-----------|
  | Frontend | React 18, TypeScript, Vite |
  | HTTP Client | Axios |
  | Routing | React Router v6 |
  | Backend | Node.js, Express, TypeScript |
  | Database | PostgreSQL (Neon serverless) via `pg` driver |
  | Auth | JWT (`jsonwebtoken`), bcrypt password hashing |
  | RBAC | Custom Express middleware (`protect`, `requireRole`) |

  ---

  ## Folder Structure

  ```
  N7AI Assessment/
  ├── backend/
  │   ├── src/
  │   │   ├── controllers/
  │   │   │   ├── authController.ts       # POST /api/auth/login
  │   │   │   └── documentController.ts  # GET / POST / DELETE /api/documents
  │   │   ├── db/
  │   │   │   ├── pool.ts                 # pg connection pool
  │   │   │   ├── schema.sql              # Table definitions (run first)
  │   │   │   └── seed.sql                # Test users (run after schema)
  │   │   ├── middleware/
  │   │   │   └── authMiddleware.ts       # protect + requireRole
  │   │   ├── routes/
  │   │   │   ├── authRoutes.ts
  │   │   │   └── documentRoutes.ts
  │   │   ├── types/                      # Shared backend type definitions
  │   │   └── index.ts                    # Express entry point + API reference page
  │   ├── .env                            # (not committed) — see .env.example
  │   ├── .env.example
  │   ├── package.json
  │   └── tsconfig.json
  │
  ├── frontend/
  │   ├── src/
  │   │   ├── components/
  │   │   │   ├── CategoryFilter.tsx      # Filter pill row
  │   │   │   ├── CreateDocumentForm.tsx  # ADMIN-only create form
  │   │   │   ├── DocumentList.tsx        # Card list with expand / delete
  │   │   │   └── PrivateRoute.tsx        # JWT-protected route wrapper
  │   │   ├── context/
  │   │   │   └── AuthContext.tsx         # Auth state + login / logout
  │   │   ├── pages/
  │   │   │   ├── LoginPage.tsx
  │   │   │   └── DashboardPage.tsx
  │   │   ├── services/
  │   │   │   ├── api.ts                  # Axios instance with JWT interceptor
  │   │   │   ├── authService.ts
  │   │   │   └── documentService.ts
  │   │   ├── types/                      # Shared frontend type definitions
  │   │   ├── App.tsx                     # Route tree
  │   │   ├── main.tsx
  │   │   └── index.css                   # Full design system (tokens + dark mode)
  │   ├── .env                            # (not committed) — see .env.example
  │   ├── .env.example
  │   ├── index.html
  │   ├── package.json
  │   └── vite.config.ts
  │
  └── README.md
  ```

  ---

  ## Prerequisites

  - Node.js ≥ 18
  - npm ≥ 9
  - A PostgreSQL database — [Neon](https://neon.tech) (free tier works)

  ---

  ## Neon Setup

  1. Sign up at [neon.tech](https://neon.tech) and create a new project.
  2. Copy the **Connection string** (looks like `postgresql://user:pass@host/db?sslmode=require`).
  3. Open the **SQL Editor** in the Neon console.
  4. Run `backend/src/db/schema.sql` — creates the `users` and `documents` tables.
  5. Run `backend/src/db/seed.sql` — inserts the two test users.

  ---

  ## Environment Variables

  ### Backend — `backend/.env`

  Copy from `backend/.env.example` and fill in real values.

  | Variable | Description |
  |----------|-------------|
  | `DATABASE_URL` | Full PostgreSQL connection string |
  | `JWT_SECRET` | Long random string used to sign JWTs |
  | `JWT_EXPIRES_IN` | Token lifetime (default: `7d`) |
  | `PORT` | Server port (default: `5000`) |

  Generate a secure secret:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

  ### Frontend — `frontend/.env`

  Copy from `frontend/.env.example`.

  | Variable | Required | Description |
  |----------|----------|-------------|
  | `VITE_API_BASE_URL` | ✅ | Backend API URL (default: `http://localhost:5000/api`) |

  ---

  ## Setup & Running

  ### 1. Backend

  ```bash
  cd backend
  npm install
  cp .env.example .env        # then fill in DATABASE_URL and JWT_SECRET
  npm run dev                  # ts-node-dev, hot reload on port 5000
  ```

  Visit `http://localhost:5000` to see the API reference page.

  ### 2. Frontend

  ```bash
  cd frontend
  npm install
  cp .env.example .env        # VITE_API_BASE_URL=http://localhost:5000/api
  npm run dev                  # Vite dev server, typically on port 5173
  ```

  Visit `http://localhost:5173` — redirects to `/dashboard`, then to `/login` if unauthenticated.

  ---

  ## Test Credentials

  | Role | Email | Password |
  |------|-------|----------|
  | Admin | `admin@test.com` | `Admin1234!` |
  | User | `user@test.com` | `User1234!` |

  > Passwords are stored as bcrypt hashes (cost 10). Plain-text values are never persisted.

  ---

  ## API Routes Summary

  All `/api/documents` routes require a valid `Authorization: Bearer <token>` header.

  | Method | Endpoint | Auth | Role | Description |
  |--------|----------|------|------|-------------|
  | `POST` | `/api/auth/login` | None | Any | Authenticate and receive JWT |
  | `GET` | `/api/health` | None | Any | Server health check |
  | `GET` | `/api/documents` | JWT | ADMIN, USER | List all documents |
  | `POST` | `/api/documents` | JWT | ADMIN only | Create a document |
  | `DELETE` | `/api/documents/:id` | JWT | ADMIN only | Delete a document |

  ### Status Codes

  | Code | Meaning |
  |------|---------|
  | `200` | OK |
  | `201` | Created |
  | `400` | Bad request (missing / invalid fields) |
  | `401` | Unauthenticated (no/invalid/expired token) |
  | `403` | Forbidden (authenticated but insufficient role) |
  | `404` | Document not found |
  | `500` | Internal server error |

  ### Example: Login

  ```bash
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@test.com","password":"Admin1234!"}'
  ```

  Response:
  ```json
  {
    "token": "<jwt>",
    "role": "ADMIN",
    "user": { "id": 1, "email": "admin@test.com", "role": "ADMIN" }
  }
  ```

  ### Example: Forbidden (USER attempting admin action)

  ```bash
  curl -X POST http://localhost:5000/api/documents \
    -H "Authorization: Bearer <user-jwt>" \
    -H "Content-Type: application/json" \
    -d '{"title":"Test","content":"...","category":"General"}'
  ```

  Response `403`:
  ```json
  { "message": "Forbidden: insufficient role" }
  ```

  ---

  ## RBAC Summary

  Security is enforced **at the backend middleware layer**, not just in the UI.

  ```
  protect          → verifies JWT signature and expiry → attaches req.user
  requireRole(...) → checks req.user.role against allowed roles → 403 if not matched
  ```

  Frontend role restrictions (hiding the create form and delete buttons for `USER`) are a UI convenience only. The server will reject any out-of-role request regardless.

  ---

  ## Deployment Recommendations

  | Concern | Recommendation |
  |---------|---------------|
  | Backend hosting | Railway, Render, or Fly.io (free tiers available) |
  | Frontend hosting | Vercel or Netlify (Vite builds to `/dist`) |
  | Database | Neon free tier (already configured) |
  | `JWT_SECRET` in prod | Set via host's environment secrets, never in `.env` committed to git |
  | CORS | Update `cors` origin in `backend/src/index.ts` to your deployed frontend URL |
  | HTTPS | All major hosts provide SSL automatically — ensure `sslmode=require` stays in `DATABASE_URL` |

  ### Production Build Commands

  ```bash
  # Backend (compile TypeScript)
  cd backend && npm run build && npm start

  # Frontend (Vite production bundle)
  cd frontend && npm run build
  # Output in frontend/dist/ — deploy this folder
  ```
