// import-data.js
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');

// Replace these values with your TARGET (New) Firebase Project configuration
const targetConfig = {
  apiKey: "AIzaSyAWXlk_uq532P-NDv_l2qCYT7lYTJ9unKo",
  authDomain: "myfestivo-main.firebaseapp.com",
  projectId: "myfestivo-main",
  storageBucket: "myfestivo-main.firebasestorage.app",
  messagingSenderId: "857484970379",
  appId: "1:857484970379:web:9e42498cf3633b18eac78e",
};

const app = initializeApp(targetConfig);
const db = getFirestore(app);

async function importUsers() {
  if (!fs.readFileSync('users-export.json')) {
    console.error('Error: users-export.json not found. Run "node export-data.js" first.');
    return;
  }

  const exportData = JSON.parse(fs.readFileSync('users-export.json', 'utf8'));
  const users = exportData.users || {};

  console.log(`Importing ${Object.keys(users).length} user documents into target project...`);
  let count = 0;

  for (const [userId, userData] of Object.entries(users)) {
    await setDoc(doc(db, 'users', userId), userData);
    count++;
    console.log(`[${count}] Imported user: ${userId} (${userData.email || 'No email'})`);
  }

  console.log(`\n🎉 Done! Imported ${count} users into the target Firebase project.`);
  process.exit(0);
}

importUsers().catch(console.error);
