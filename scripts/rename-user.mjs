import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const dbPath = path.join(process.cwd(), 'data', 'database.json');
const raw = fs.readFileSync(dbPath, 'utf8');

// Replace all Abhishek with Abhisar
const updated = raw.split('"Abhishek"').join('"Abhisar"');
fs.writeFileSync(dbPath, updated, 'utf8');

const tmpFile = path.join(os.tmpdir(), 'codeclash_database.json');
try {
  fs.writeFileSync(tmpFile, updated, 'utf8');
} catch {}

const db = JSON.parse(updated);
console.log('Success! Users in database:');
console.log(db.users.map(u => ({ id: u.id, name: u.name, handle: u.handle, email: u.email })));
