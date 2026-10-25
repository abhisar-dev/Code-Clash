import { Pool, PoolConfig } from 'pg';
import dns from 'dns';

// Ensure resilient public DNS resolution across local ISPs & serverless
try {
  if (typeof dns.setServers === 'function') {
    dns.setServers(['8.8.8.8', '1.1.1.1', '208.67.222.222']);
  }
} catch {
  // Edge environments ignore setServers
}

const NEON_DEFAULT_URL =
  'postgresql://neondb_owner:npg_sDPO09gHkrVM@ep-bitter-tree-b4va883u-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

const connectionString = process.env.DATABASE_URL || NEON_DEFAULT_URL;

let parsedHost = 'ep-bitter-tree-b4va883u-pooler.c-6.us-east-2.aws.neon.tech';
let parsedUser = 'neondb_owner';
let parsedPassword = 'npg_sDPO09gHkrVM';
let parsedDatabase = 'neondb';
let parsedPort = 5432;

try {
  const u = new URL(connectionString);
  parsedHost = u.hostname || parsedHost;
  parsedUser = u.username || parsedUser;
  parsedPassword = decodeURIComponent(u.password) || parsedPassword;
  parsedDatabase = u.pathname.replace(/^\//, '') || parsedDatabase;
  parsedPort = parseInt(u.port, 10) || 5432;
} catch {}

let resolvedIp: string | null = null;

async function getDirectHost(): Promise<string> {
  if (resolvedIp) return resolvedIp;
  try {
    const addrs = await new Promise<string[]>((resolve, reject) => {
      dns.resolve4(parsedHost, (err, ips) => (err ? reject(err) : resolve(ips)));
    });
    if (addrs && addrs.length > 0) {
      resolvedIp = addrs[0];
      return resolvedIp;
    }
  } catch {
    // If resolve4 fails, fall back to hostname
  }
  return parsedHost;
}

// Global pool cache for serverless environments (prevents connection exhaustion)
declare global {
  // eslint-disable-next-line no-var
  var __postgresPool: Pool | undefined;
}

let activePool: Pool | null = globalThis.__postgresPool || null;

export async function getPool(): Promise<Pool> {
  if (activePool) return activePool;

  const targetHost = await getDirectHost();

  const poolConfig: PoolConfig = {
    host: targetHost,
    port: parsedPort,
    user: parsedUser,
    password: parsedPassword,
    database: parsedDatabase,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: {
      rejectUnauthorized: false,
      servername: parsedHost,
    },
  };

  activePool = new Pool(poolConfig);

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
