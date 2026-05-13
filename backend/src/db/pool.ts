import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false },
  // Pool tuning
  max: 10,                // maximum number of clients in the pool
  idleTimeoutMillis: 30000,   // close idle clients after 30 s
  connectionTimeoutMillis: 5000, // error if connection not acquired within 5 s
});

pool.on('connect', (client: PoolClient) => {
  console.log('[DB] New client connected to PostgreSQL');
});

pool.on('error', (err: Error) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
  process.exit(-1);
});

/** Verify the pool can reach the database (used at startup). */
export async function testConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW() AS now');
    console.log(`[DB] Connection verified – server time: ${result.rows[0].now}`);
  } finally {
    client.release();
  }
}

/** Gracefully drain the pool (call on SIGTERM / SIGINT). */
export async function closePool(): Promise<void> {
  await pool.end();
  console.log('[DB] Pool has ended');
}

export default pool;
