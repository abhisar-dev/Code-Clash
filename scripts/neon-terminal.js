const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { Pool, neon } = require('@neondatabase/serverless');

// Load environment variables from .env.local if present
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = (match[2] || '').trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
} catch {}

const DEFAULT_URL =
  'postgresql://neondb_owner:npg_sDPO09gHkrVM@ep-bitter-tree-b4va883u-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

let activeUrl = process.env.DATABASE_URL || DEFAULT_URL;

const G = '\x1b[32m'; // Green
const C = '\x1b[36m'; // Cyan
const Y = '\x1b[33m'; // Yellow
const R = '\x1b[31m'; // Red
const B = '\x1b[1m';  // Bold
const D = '\x1b[2m';  // Dim
const M = '\x1b[35m'; // Magenta
const RST = '\x1b[0m'; // Reset

let pool = null;
let httpSql = null;
let activeHost = 'ep-bitter-tree-b4va883u-pooler.c-6.us-east-2.aws.neon.tech';
let activeDb = 'neondb';

function parseDbInfo(url) {
  try {
    const u = new URL(url);
    activeHost = u.hostname || activeHost;
    activeDb = u.pathname.replace(/^\//, '') || activeDb;
  } catch {}
}

async function connectToNeon(url) {
  parseDbInfo(url);
  if (pool) {
    try { await pool.end(); } catch {}
  }
  
  // Method 1: Neon Serverless WebSocket Pool (Port 443 HTTPS/WSS)
  try {
    pool = new Pool({ connectionString: url });
    const res = await pool.query('SELECT 1 as num, current_database() as db');
    httpSql = neon(url);
    return { method: 'WebSocket Pool (WSS :443)', db: res.rows[0]?.db || activeDb };
  } catch (errWs) {
    // Method 2: Neon Serverless HTTP Stateless Driver (Port 443 HTTPS)
    try {
      httpSql = neon(url);
      const resHttp = await httpSql.query('SELECT 1 as num, current_database() as db');
      pool = null;
      return { method: 'Serverless HTTP Driver (HTTPS :443)', db: resHttp[0]?.db || activeDb };
    } catch (errHttp) {
      throw new Error(`Connection failed across WSS & HTTPS: ${errWs.message} / ${errHttp.message}`);
    }
  }
}

async function executeSql(sql) {
  if (pool) {
    const res = await pool.query(sql);
    return res.rows;
  } else if (httpSql) {
    return await httpSql.query(sql);
  }
  throw new Error('No active database connection.');
}

async function startTerminal() {
  console.clear();
  parseDbInfo(activeUrl);

  console.log(`${G}${B}`);
  console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                   NEON CLOUD POSTGRESQL TERMINAL v2.0                          ║');
  console.log('║  Engine: Neon Serverless Cloud · TLS Port 443 (Firewall-Immune)                ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝');
  console.log(`${RST}`);
  console.log(`${D}Host: ${activeHost} | Database: ${activeDb}${RST}`);
  console.log(`${D}Connecting to Neon Cloud Database...${RST}`);

  let connInfo;
  try {
    const t0 = Date.now();
    connInfo = await connectToNeon(activeUrl);
    const ms = Date.now() - t0;
    console.log(`${G}✓ Connected successfully via ${connInfo.method} in ${ms}ms!${RST}\n`);
  } catch (err) {
    console.error(`${R}✗ Connection failed: ${err.message}${RST}\n`);
    console.log(`${Y}You can type: \\switch <your_neon_url> to connect with another database.${RST}\n`);
  }

  console.log(`${Y}${B}Quick Commands:${RST}`);
  console.log(`  ${C}\\dt${RST}        - List all tables with row count`);
  console.log(`  ${C}\\users${RST}     - Show competitive programmers & ratings`);
  console.log(`  ${C}\\matches${RST}   - Show latest 1v1 clashes`);
  console.log(`  ${C}\\subs${RST}      - Show latest code submissions`);
  console.log(`  ${C}\\rooms${RST}     - Show active match rooms`);
  console.log(`  ${C}\\stats${RST}     - Show live database storage breakdown`);
  console.log(`  ${C}\\schema <t>${RST}- Show table column definitions`);
  console.log(`  ${C}\\ping${RST}      - Test round-trip latency to Neon`);
  console.log(`  ${C}\\switch <url>${RST}- Switch connection to another Neon project`);
  console.log(`  ${C}clear${RST}      - Clear terminal screen`);
  console.log(`  ${C}exit${RST}       - Quit terminal\n`);
  console.log(`${D}Type any custom SQL (e.g. SELECT * FROM users;) and press Enter:${RST}\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${G}${activeDb}${RST}${C}#${RST} `,
  });

  rl.prompt();

  let isExecuting = false;

  rl.on('line', async (line) => {
    if (isExecuting) return;
    const cmd = line.trim();

    if (!cmd) {
      rl.prompt();
      return;
    }

    if (cmd === 'exit' || cmd === '\\q' || cmd === 'quit') {
      console.log(`${D}Closing connection to Neon Cloud...${RST}`);
      if (pool) {
        try { await pool.end(); } catch {}
      }
      process.exit(0);
    }

    if (cmd === 'clear' || cmd === 'cls') {
      console.clear();
      rl.prompt();
      return;
    }

    if (cmd === '\\help' || cmd === 'help') {
      console.log(`\n${Y}Available Commands:${RST}`);
      console.log(`  \\dt, \\tables     - List all tables`);
      console.log(`  \\users           - List registered users`);
      console.log(`  \\matches         - List recent 1v1 clashes`);
      console.log(`  \\subs            - List recent submissions`);
      console.log(`  \\rooms           - List active match rooms`);
      console.log(`  \\stats           - Show counts for all tables`);
      console.log(`  \\schema <table>  - Show column details for a table`);
      console.log(`  \\ping            - Check connection latency`);
      console.log(`  \\switch <url>    - Switch to another Neon database`);
      console.log(`  clear, cls       - Clear screen`);
      console.log(`  exit, \\q         - Exit terminal\n`);
      rl.prompt();
      return;
    }

    if (cmd.startsWith('\\switch')) {
      const parts = cmd.split(/\s+/);
      const newUrl = parts[1];
      if (!newUrl) {
        console.log(`${R}Usage: \\switch <postgresql://...>${RST}\n`);
      } else {
        console.log(`${D}Switching to: ${newUrl.replace(/:[^@:]+@/, ':***@')}...${RST}`);
        try {
          const t0 = Date.now();
          const info = await connectToNeon(newUrl);
          activeUrl = newUrl;
          rl.setPrompt(`${G}${activeDb}${RST}${C}#${RST} `);
          console.log(`${G}✓ Switched to ${activeDb} via ${info.method} in ${Date.now() - t0}ms!${RST}\n`);
        } catch (e) {
          console.log(`${R}✗ Switch failed: ${e.message}${RST}\n`);
        }
      }
      rl.prompt();
      return;
    }

    if (cmd === '\\ping') {
      try {
        const t0 = Date.now();
        await executeSql('SELECT 1');
        const ms = Date.now() - t0;
        console.log(`${G}✓ Neon Cloud Latency: ${ms}ms${RST}\n`);
      } catch (e) {
        console.log(`${R}✗ Ping failed: ${e.message}${RST}\n`);
      }
      rl.prompt();
      return;
    }

    let sql = cmd;

    if (cmd.startsWith('\\schema')) {
      const parts = cmd.split(/\s+/);
      const tbl = parts[1] || 'users';
      sql = `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${tbl.replace(/'/g, "''")}' ORDER BY ordinal_position;`;
    } else if (cmd === '\\dt' || cmd === '\\tables') {
      sql = `SELECT tablename as "Table Name", tableowner as "Owner" FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;`;
    } else if (cmd === '\\users') {
      sql = `SELECT id, name, handle, course, elo, matches_won as "won", matches_played as "played", role FROM users ORDER BY elo DESC LIMIT 20;`;
    } else if (cmd === '\\matches') {
      sql = `SELECT id, room_id as "Room", player1_id as "P1", player2_id as "P2", winner_id as "Winner", created_at as "Date" FROM matches ORDER BY created_at DESC LIMIT 10;`;
    } else if (cmd === '\\subs') {
      sql = `SELECT id, user_id as "User", problem_id as "Prob#", language as "Lang", status as "Status", runtime_ms as "Runtime(ms)" FROM submissions ORDER BY created_at DESC LIMIT 10;`;
    } else if (cmd === '\\rooms') {
      sql = `SELECT room_id, status, host_id, guest_id, created_at FROM active_rooms ORDER BY created_at DESC LIMIT 10;`;
    } else if (cmd === '\\stats') {
      sql = `
        SELECT 
          (SELECT COUNT(*) FROM users) as "Total Users",
          (SELECT COUNT(*) FROM matches) as "Total Matches",
          (SELECT COUNT(*) FROM submissions) as "Total Submissions",
          (SELECT COUNT(*) FROM visits) as "Total Visits",
          (SELECT COUNT(*) FROM audit_logs) as "Audit Logs";
      `;
    }

    isExecuting = true;
    try {
      const start = Date.now();
      const rows = await executeSql(sql);
      const elapsed = Date.now() - start;

      if (rows && rows.length > 0) {
        console.table(rows);
        console.log(`${G}✓ ${rows.length} row(s) returned (${elapsed}ms)${RST}\n`);
      } else {
        console.log(`${G}✓ Query executed successfully, 0 rows returned (${elapsed}ms)${RST}\n`);
      }
    } catch (err) {
      console.log(`${R}✗ Error: ${err.message}${RST}\n`);
    } finally {
      isExecuting = false;
      rl.prompt();
    }
  });

  rl.on('close', async () => {
    if (pool) {
      try { await pool.end(); } catch {}
    }
    console.log(`\n${D}Disconnected from Neon Cloud.${RST}`);
    process.exit(0);
  });
}

startTerminal();
