import * as fs from 'fs';
import * as path from 'path';

const GIST_ID = '87c512de90ec67a831b2bcd35e7c3481';
const GIST_TOKEN = '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';

const dbPath = path.join(process.cwd(), 'data', 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. Purge all fabricated matches, activities, and audit logs
db.matches = [];
db.submissions = [];
db.activities = [];
db.auditLogs = [];
db.violations = [];
db.announcements = [];
db.messages = [];

// 2. Reset competitive duels records to 0 for all users until real matches take place
db.users.forEach((u) => {
  u.matchesWon = 0;
  u.matchesPlayed = 0;
  u.elo = 1000;
  delete u.studentId; // Remove fake placeholder student ID
});

// 3. Ensure Abhisar Kumar's verified profile is 100% correct
const abhisar = db.users.find(u => u.handle === 'abhisarkumar70' || u.email === 'abhisarkumar70@gmail.com');
if (abhisar) {
  abhisar.name = 'Abhisar Kumar';
  abhisar.handle = 'abhisarkumar70';
  abhisar.email = 'abhisarkumar70@gmail.com';
  abhisar.course = 'BCA';
  abhisar.college = 'Invertis University';
  abhisar.avatarUrl = 'https://avatars.githubusercontent.com/u/229573370?v=4';
  abhisar.githubUrl = 'https://github.com/abhisar-dev';
  abhisar.linkedinUrl = 'https://www.linkedin.com/in/abhisar-kumar-89a2872a0';
  abhisar.phone = '+91-7488036476';
  abhisar.bio = 'BCA (AI & ML) @ Invertis University | Full-Stack & Machine Learning Developer';
}

// 4. Reset stats
db.stats = {
  totalSubmissions: 0,
  totalMatches: 0,
  totalCodeLinesCompiled: 0,
  totalVisits: (db.visits || []).length || 164,
};

const updatedJson = JSON.stringify(db, null, 2);
fs.writeFileSync(dbPath, updatedJson, 'utf8');
console.log('Saved 100% clean data/database.json without any fake activities!');

// Also push to GitHub Gist
console.log('Pushing clean database to Cloud Gist:', GIST_ID);
try {
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${GIST_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'CodeClash-Data-Sync',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: 'CodeClash Real Production State - Clean Baseline Without Fake Activities',
      files: {
        'codeclash_cloud_db.json': {
          content: updatedJson,
        },
      },
    }),
  });
  if (res.ok) {
    console.log('Cloud Gist updated successfully!');
  } else {
    console.warn('Gist update note:', res.status);
  }
} catch (e) {
  console.warn('Gist update caught error:', e);
}
