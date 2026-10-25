const readline = require('readline');
const dns = require('dns');
const { Client } = require('pg');

// Public DNS to ensure connection resilience across local ISP restrictions
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

const DEFAULT_URL =
  'postgresql://neondb_owner:npg_sDPO09gHkrVM@ep-bitter-tree-b4va883u-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

const connectionString = process.env.DATABASE_URL || DEFAULT_URL;

const G = '\x1b[32m'; // Green
const C = '\x1b[36m'; // Cyan
const Y = '\x1b[33m'; // Yellow
const R = '\x1b[31m'; // Red
const B = '\x1b[1m';  // Bold
const D = '\x1b[2m';  // Dim
const RST = '\x1b[0m'; // Reset

async function getClient() {
  const hostname = 'ep-bitter-tree-b4va883u-pooler.c-6.us-east-2.aws.neon.tech';
  let host = hostname;
  try {
    const ips = await new Promise((res, rej) =>
      dns.resolve4(hostname, (err, addrs) => (err ? rej(err) : res(addrs)))
    );
    if (ips && ips.length > 0) host = ips[0];
  } catch {}

  const client = new Client({
    host,
    port: 5432,
    user: 'neondb_owner',
    password: 'npg_sDPO09gHkrVM',
    database: 'neondb',
    ssl: {
      rejectUnauthorized: false,
      servername: hostname,
    },
  });

  await client.connect();
  return client;
}

async function startTerminal() {
  console.clear();
  console.log(`${G}${B}`);
  console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                   NEON CLOUD POSTGRESQL TERMINAL v1.0                          ║');
  console.log('║  Host: ep-bitter-tree-b4va883u-pooler.c-6.us-east-2.aws.neon.tech              ║');
  console.log('║  Database: neondb  |  SSL: TLS Active  |  Region: us-east-2 (AWS)              ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝');
  console.log(`${RST}`);
  console.log(`${D}Connecting to Neon Cloud Database...${RST}`);

  let client;
  try {
    const t0 = Date.now();
    client = await getClient();
    const handshakeMs = Date.now() - t0;
    console.log(`${G}✓ Connected successfully in ${handshakeMs}ms!${RST}\n`);
  } catch (err) {
    console.error(`${R}✗ Connection failed: ${err.message}${RST}`);
    process.exit(1);
  }

  console.log(`${Y}${B}Quick Commands:${RST}`);
  console.log(`  ${C}\\dt${RST}     - List all database tables`);
  console.log(`  ${C}\\users${RST}  - Show competitive programmers & ratings`);
  console.log(`  ${C}\\matches${RST}- Show latest 1v1 clashes`);
  console.log(`  ${C}\\subs${RST}   - Show latest code submissions`);
  console.log(`  ${C}\\stats${RST}  - Show live database storage breakdown`);
  console.log(`  ${C}clear${RST}   - Clear screen`);
  console.log(`  ${C}exit${RST}    - Quit terminal\n`);
  console.log(`${D}Type any custom SQL (e.g. SELECT * FROM users;) and press Enter:${RST}\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${G}neondb${RST}${C}#${RST} `,
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
      try {
        await client.end();
      } catch {}
      process.exit(0);
    }

    if (cmd === 'clear' || cmd === 'cls') {
      console.clear();
      rl.prompt();
      return;
    }

    let sql = cmd;
    if (cmd === '\\dt' || cmd === '\\tables') {
      sql = `SELECT tablename as "Table Name", tableowner as "Owner" FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;`;
    } else if (cmd === '\\users') {
      sql = `SELECT id, name, handle, course, elo, matches_won as "won", matches_played as "played", role FROM users ORDER BY elo DESC;`;
    } else if (cmd === '\\matches') {
      sql = `SELECT id, room_id as "Room", player1_id as "P1", player2_id as "P2", winner_id as "Winner", created_at as "Date" FROM matches ORDER BY created_at DESC LIMIT 10;`;
    } else if (cmd === '\\subs') {
      sql = `SELECT id, user_id as "User", problem_id as "Prob#", language as "Lang", status as "Status", runtime_ms as "Runtime(ms)" FROM submissions ORDER BY created_at DESC LIMIT 10;`;
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
      const res = await client.query(sql);
      const elapsed = Date.now() - start;

      if (res.rows && res.rows.length > 0) {
        console.table(res.rows);
        console.log(`${G}✓ ${res.rows.length} row(s) returned (${elapsed}ms)${RST}\n`);
      } else {
        console.log(`${G}✓ Query executed successfully, 0 rows (${elapsed}ms)${RST}\n`);
      }
    } catch (err) {
      console.log(`${R}✗ Error: ${err.message}${RST}\n`);
    } finally {
      isExecuting = false;
      rl.prompt();
    }
  });

  rl.on('close', async () => {
    try {
      await client.end();
    } catch {}
    console.log(`\n${D}Disconnected from Neon Cloud.${RST}`);
    process.exit(0);
  });
}

startTerminal();
