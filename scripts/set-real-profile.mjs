import * as fs from 'fs';
import * as path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

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
  delete abhisar.studentId;
}

if (Array.isArray(db.auditLogs)) {
  db.auditLogs.forEach(l => {
    if (l.userHandle === 'abhisarkumar70' || l.userName?.toLowerCase().includes('abhisar')) {
      l.userName = 'Abhisar Kumar';
    }
  });
}

if (Array.isArray(db.userSessions)) {
  db.userSessions.forEach(s => {
    if (s.userHandle === 'abhisarkumar70' || s.userName?.toLowerCase().includes('abhisar')) {
      s.userName = 'Abhisar Kumar';
    }
  });
}

const updated = JSON.stringify(db, null, 2);
fs.writeFileSync(dbPath, updated, 'utf8');
console.log('Saved data/database.json!');
console.log('Abhisar profile:', db.users.find(u => u.handle === 'abhisarkumar70'));
