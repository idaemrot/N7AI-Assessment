import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/authRoutes';
import documentRoutes from './routes/documentRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// ── Global middleware ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ── Root — HTML API reference page ─────────────────────────────────────────
app.get('/', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Document API</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #0f1117;
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 3rem 1.5rem;
    }
    .container { width: 100%; max-width: 680px; }

    /* Header */
    .header { margin-bottom: 2.5rem; }
    .mark {
      display: inline-flex; align-items: center; justify-content: center;
      width: 2.75rem; height: 2.75rem;
      background: #2563eb; color: #fff;
      font-size: 0.875rem; font-weight: 700; letter-spacing: -0.5px;
      border-radius: 8px; margin-bottom: 1.25rem;
    }
    h1 { font-size: 1.5rem; font-weight: 700; color: #f8fafc; letter-spacing: -0.4px; }
    .subtitle { font-size: 0.9rem; color: #64748b; margin-top: 0.375rem; }

    /* Status pill */
    .status-row { display: flex; align-items: center; gap: 0.625rem; margin-top: 1rem; }
    .status-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 0 3px rgba(34,197,94,0.2);
    }
    .status-text { font-size: 0.8125rem; color: #22c55e; font-weight: 500; }
    .timestamp { font-size: 0.8125rem; color: #475569; margin-left: auto; }

    /* Section */
    .section { margin-bottom: 2rem; }
    .section-title {
      font-size: 0.6875rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: #475569;
      margin-bottom: 0.75rem;
    }

    /* Route rows */
    .route-list { display: flex; flex-direction: column; gap: 1px; border-radius: 10px; overflow: hidden; }
    .route {
      display: flex; align-items: center; gap: 0.875rem;
      padding: 0.75rem 1rem;
      background: #1e2332;
      border: 1px solid transparent;
    }
    .route:first-child { border-radius: 10px 10px 0 0; }
    .route:last-child  { border-radius: 0 0 10px 10px; }
    .route:only-child  { border-radius: 10px; }
    .route + .route { border-top: 1px solid #0f1117; }

    /* Method badges */
    .method {
      display: inline-block; min-width: 3.5rem; text-align: center;
      padding: 0.1875rem 0.5rem;
      font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.04em;
      border-radius: 5px;
    }
    .get  { background: #0c4a6e; color: #38bdf8; }
    .post { background: #064e3b; color: #34d399; }
    .del  { background: #450a0a; color: #f87171; }

    .route-path { font-size: 0.875rem; color: #cbd5e1; font-family: 'Cascadia Code', 'Fira Code', monospace; }
    .route-desc { margin-left: auto; font-size: 0.8rem; color: #475569; white-space: nowrap; }

    /* Auth requirement tag */
    .auth-tag {
      font-size: 0.65rem; font-weight: 600; letter-spacing: 0.04em;
      padding: 0.125rem 0.375rem; border-radius: 4px;
      background: #1e3a5f; color: #60a5fa;
    }
    .auth-tag.admin { background: #3b1f5e; color: #c084fc; }

    /* Footer */
    .footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #1e2332; }
    .footer p { font-size: 0.8125rem; color: #334155; }
    .footer a { color: #3b82f6; text-decoration: none; }
    .footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">

    <header class="header">
      <h1>Document API</h1>
      <p class="subtitle">Express · TypeScript · PostgreSQL · JWT</p>
      <div class="status-row">
        <div class="status-dot"></div>
        <span class="status-text">Server online</span>
        <span class="timestamp">${new Date().toISOString()}</span>
      </div>
    </header>

    <div class="section">
      <p class="section-title">Authentication</p>
      <div class="route-list">
        <div class="route">
          <span class="method post">POST</span>
          <span class="route-path">/api/auth/login</span>
          <span class="route-desc">Returns JWT token</span>
        </div>
      </div>
    </div>

    <div class="section">
      <p class="section-title">Documents</p>
      <div class="route-list">
        <div class="route">
          <span class="method get">GET</span>
          <span class="route-path">/api/documents</span>
          <span class="auth-tag">JWT</span>
          <span class="route-desc">ADMIN · USER</span>
        </div>
        <div class="route">
          <span class="method post">POST</span>
          <span class="route-path">/api/documents</span>
          <span class="auth-tag admin">ADMIN</span>
          <span class="route-desc">Create document</span>
        </div>
        <div class="route">
          <span class="method del">DEL</span>
          <span class="route-path">/api/documents/:id</span>
          <span class="auth-tag admin">ADMIN</span>
          <span class="route-desc">Delete document</span>
        </div>
      </div>
    </div>

    <div class="section">
      <p class="section-title">System</p>
      <div class="route-list">
        <div class="route">
          <span class="method get">GET</span>
          <span class="route-path">/api/health</span>
          <span class="route-desc">Health check</span>
        </div>
      </div>
    </div>

    <footer class="footer">
      <p>Port <strong>${process.env.PORT || 5000}</strong> &nbsp;·&nbsp; Node ${process.version} &nbsp;·&nbsp; v1.0.0</p>
    </footer>

  </div>
</body>
</html>`);
});

// ── 404 fallback (API routes only) ─────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
