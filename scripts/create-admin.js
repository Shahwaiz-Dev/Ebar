// Script to create admin users
// Run with: node scripts/create-admin.js

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// and place it in the project root as 'service-account-key.json'
const serviceAccount = require('../service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://barweb-2cb4c-default-rtdb.firebaseio.com"
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdmin() {
  try {
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const firstName = await question('Enter first name: ');
    const lastName = await question('Enter last name: ');

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: `${firstName} ${lastName}`
    });

    // Create user document in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: email,
      firstName: firstName,
      lastName: lastName,
      type: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Admin user created successfully!');
    console.log(`User ID: ${userRecord.uid}`);
    console.log(`Email: ${email}`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    rl.close();
    process.exit();
  }
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

createAdmin();
