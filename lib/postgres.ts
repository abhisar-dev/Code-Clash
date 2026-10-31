import { Pool as NeonPool } from '@neondatabase/serverless';
import type { Pool } from 'pg';

const NEON_DEFAULT_URL =
  'postgresql://neondb_owner:npg_sDPO09gHkrVM@ep-bitter-tree-b4va883u-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

const connectionString = process.env.DATABASE_URL || NEON_DEFAULT_URL;

// Global pool cache for serverless environments (prevents connection exhaustion)
declare global {
  // eslint-disable-next-line no-var
  var __postgresPool: any | undefined;
}

let activePool: any = globalThis.__postgresPool || null;

export async function getPool(): Promise<any> {
  if (activePool) return activePool;

  try {
    // Primary: Neon Serverless WebSocket Pool (Port 443, immune to ISP port 5432 blocks)
    activePool = new NeonPool({
      connectionString,
    });
  } catch {
    // Fallback
    const { Pool: PgPool } = await import('pg');
    activePool = new PgPool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__postgresPool = activePool;
  }

  return activePool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = await getPool();
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}
