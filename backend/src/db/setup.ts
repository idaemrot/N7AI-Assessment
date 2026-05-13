/**
 * backend/src/db/setup.ts
 *
 * Idempotent database setup script.
 * Run once (or any time) to:
 *  1. Create the schema (tables, types, indexes)
 *  2. Seed the two hardcoded users with bcrypt-hashed passwords
 *
 * Usage:
 *   npm run db:setup
 */

import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('[Setup] ERROR: DATABASE_URL is not set in .env');
  process.exit(1);
}

// ── Standalone pool (not the shared app pool) ─────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')
    ? false
    : { rejectUnauthorized: false },
});

// ── Seed users definition ─────────────────────────────────
const SEED_USERS = [
  { email: 'admin@test.com', password: 'Admin1234!', role: 'ADMIN' as const },
  { email: 'user@test.com',  password: 'User1234!',  role: 'USER'  as const },
];

const BCRYPT_ROUNDS = 10;

async function runSchema(client: import('pg').PoolClient): Promise<void> {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  console.log('[Setup] Running schema.sql …');
  await client.query(sql);
  console.log('[Setup] ✔ Schema applied');
}

async function seedUsers(client: import('pg').PoolClient): Promise<void> {
  console.log('[Setup] Seeding users …');

  for (const user of SEED_USERS) {
    const hash = await bcrypt.hash(user.password, BCRYPT_ROUNDS);
    const result = await client.query(
      `INSERT INTO users (email, password, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, role`,
      [user.email, hash, user.role]
    );

    if (result.rowCount && result.rowCount > 0) {
      console.log(`[Setup]   ✔ Created ${user.role}: ${user.email}`);
    } else {
      console.log(`[Setup]   – Skipped (already exists): ${user.email}`);
    }
  }
}

async function main(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await runSchema(client);
    await seedUsers(client);
    await client.query('COMMIT');
    console.log('\n[Setup] ✅ Database setup complete!\n');
    console.log('  Users:');
    console.log('    admin@test.com  (role: ADMIN, password: Admin1234!)');
    console.log('    user@test.com   (role: USER,  password: User1234!)');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Setup] ❌ Setup failed – rolled back:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
