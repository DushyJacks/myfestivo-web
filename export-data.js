// export-data.js
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');

// 1. Source Firebase Configuration (Current Project)
const sourceConfig = {
  apiKey: "AIzaSyCFG1SNWfez77o-KoWOkYnn6D1D86d_BPI",
  authDomain: "myfestivo.firebaseapp.com",
  projectId: "myfestivo",
  storageBucket: "myfestivo.firebasestorage.app",
  messagingSenderId: "56147733860",
  appId: "1:56147733860:web:d1ded45a63df30de691e71",
  measurementId: "G-CLLF8QR316",
};

// Optional: Fill in an admin/user email & password if your Firestore rules require authentication
const AUTH_EMAIL = ""; // e.g. "admin@example.com"
const AUTH_PASSWORD = ""; // e.g. "password123"

const app = initializeApp(sourceConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const collectionsToExport = ['users'];

async function exportCollections() {
  if (AUTH_EMAIL && AUTH_PASSWORD) {
    console.log(`Authenticating as ${AUTH_EMAIL}...`);
    await signInWithEmailAndPassword(auth, AUTH_EMAIL, AUTH_PASSWORD);
    console.log('✓ Authentication successful.');
  }

  const exportData = {};

  for (const colName of collectionsToExport) {
    console.log(`Exporting '${colName}' collection...`);
    const snapshot = await getDocs(collection(db, colName));
    exportData[colName] = {};

    snapshot.forEach((doc) => {
      exportData[colName][doc.id] = doc.data();
    });

    console.log(`✓ Exported ${snapshot.size} user documents`);
  }

  fs.writeFileSync('users-export.json', JSON.stringify(exportData, null, 2));
  console.log('\n🎉 Successfully saved user data to users-export.json!');
  process.exit(0);
}

exportCollections().catch((err) => {
  if (err.code === 'permission-denied') {
    console.error('\n❌ Permission Denied Error: Your Firestore Security Rules block unauthenticated reads on users.');
    console.error('\nQuick Fix Option A:');
    console.error('1. Go to Firebase Console -> Firestore Database -> Rules');
    console.error('2. Temporarily change "match /users/{userId} { allow read: if request.auth.uid == userId; }" to "allow read: if true;"');
    console.error('3. Click Publish, then re-run: node export-data.js\n');
    console.error('Quick Fix Option B:');
    console.error('Enter an existing user account email & password in export-data.js (AUTH_EMAIL and AUTH_PASSWORD) and re-run.');
  } else {
    console.error('Export Error:', err);
  }
});


