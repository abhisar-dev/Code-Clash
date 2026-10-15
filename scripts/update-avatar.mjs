import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const GIST_ID = '87c512de90ec67a831b2bcd35e7c3481';
const GIST_TOKEN = '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';

const dbPath = path.join(process.cwd(), 'data', 'database.json');
const raw = fs.readFileSync(dbPath, 'utf8');
const data = JSON.parse(raw);

const abhisar = data.users.find(u => u.handle === 'abhisarkumar70' || u.email === 'abhisarkumar70@gmail.com');
if (abhisar) {
  abhisar.avatarUrl = 'https://avatars.githubusercontent.com/u/229573370?v=4';
  abhisar.githubUrl = 'https://github.com/abhisar-dev';
  console.log('Updated Abhisar with avatarUrl:', abhisar.avatarUrl);
} else {
  console.error('Abhisar not found in users!');
  process.exit(1);
}

const updatedJson = JSON.stringify(data, null, 2);
fs.writeFileSync(dbPath, updatedJson, 'utf8');

const tmpPath = path.join(os.tmpdir(), 'codeclash_database.json');
try {
  fs.writeFileSync(tmpPath, updatedJson, 'utf8');
} catch {}

console.log('Local database updated.');

console.log('Pushing updated database to GitHub Gist:', GIST_ID);
const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${GIST_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'CodeClash-Data-Sync',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    description: 'CodeClash Real Production State with Abhisar Profile Picture & College Rankings',
    files: {
      'codeclash_cloud_db.json': {
        content: updatedJson,
      },
    },
  }),
});

if (res.ok) {
  console.log('Successfully updated Cloud Gist with avatarUrl!');
} else {
  const err = await res.text();
  console.error('Failed to update Gist:', res.status, err);
}
