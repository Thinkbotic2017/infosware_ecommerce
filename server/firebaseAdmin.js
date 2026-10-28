const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const credentialPath = path.join(
  __dirname,
  "config",
  "serviceAccountKey.json"
);
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else if (fs.existsSync(credentialPath)) {
  serviceAccount = require(credentialPath);
} else {
  throw new Error(
    "Firebase Admin credentials are missing. Set FIREBASE_SERVICE_ACCOUNT or add server/config/serviceAccountKey.json."
  );
}

if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

module.exports = admin.apps.length
  ? admin.app()
  : admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
