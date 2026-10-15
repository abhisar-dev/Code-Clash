import * as fs from 'fs';
import * as path from 'path';

const GIST_ID = '87c512de90ec67a831b2bcd35e7c3481';
const GIST_TOKEN = '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';

const dbPath = path.join(process.cwd(), 'data', 'database.json');
const content = fs.readFileSync(dbPath, 'utf8');

// Double check no 'Abhishek' in content
if (content.includes('"Abhishek"')) {
  console.error('Error: "Abhishek" still found in database.json!');
  process.exit(1);
}

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
    description: 'CodeClash Real Production State with Abhisar Profile & College Rankings',
    files: {
      'codeclash_cloud_db.json': {
        content: content,
      },
    },
  }),
});

if (res.ok) {
  console.log('Successfully updated Cloud Gist with Abhisar data!');
} else {
  const err = await res.text();
  console.error('Failed to update Gist:', res.status, err);
}
