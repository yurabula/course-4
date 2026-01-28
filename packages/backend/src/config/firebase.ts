import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

const serviceAccountPath = path.join(__dirname, '..', '..', 'serviceAccountKey.json');

let serviceAccount: any = null;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
  serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
} else if (fs.existsSync(serviceAccountPath)) {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
}

if (!serviceAccount) {
  try {
    admin.initializeApp();
  } catch (e) {
    throw new Error('Firebase service account not found. Set GOOGLE_APPLICATION_CREDENTIALS or add serviceAccountKey.json');
  }
} else {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const auth = admin.auth();
export const db = admin.firestore();