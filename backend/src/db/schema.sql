-- ============================================================
-- Document Portal – Database Schema
-- Target: PostgreSQL 14+ (Neon serverless)
-- ============================================================

-- ── Role enum ─────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── Users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL       PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   TEXT         NOT NULL,          -- bcrypt hash
  role       user_role    NOT NULL DEFAULT 'USER',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- index for fast login lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ── Documents ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id         SERIAL       PRIMARY KEY,
  title      VARCHAR(500) NOT NULL,
  content    TEXT         NOT NULL DEFAULT '',
  category   VARCHAR(100) NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- index for category filtering / listing
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents (category);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents (created_at DESC);
