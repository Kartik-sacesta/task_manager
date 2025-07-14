const admin = require("firebase-admin");
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
;

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
  if (!admin.apps.length) {
    console.error("Error initializing Firebase Admin SDK:", error);
  } else {
    console.log("Firebase Admin SDK already initialized.");
  }
}

module.exports = admin;
