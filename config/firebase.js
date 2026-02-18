/**
 * Firebase Configuration
 *
 * Replace the firebaseConfig values below with your own project's credentials.
 * Get them from: Firebase Console → Project Settings → Your apps → SDK setup and configuration
 *
 * Steps:
 *  1. Go to https://console.firebase.google.com/
 *  2. Create a project (or open an existing one)
 *  3. Add a Web app  ( </> icon )
 *  4. Copy the firebaseConfig object and paste it below
 *  5. In the Firebase Console enable the services you need:
 *       - Authentication  → Sign-in method → Email/Password
 *       - Firestore Database → Create database
 *       - Realtime Database  → Create database
 *       - Storage           → Get started
 */

import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCooiPC0xnr3g0v6I0rs5-ou-2fGfy8NgE',
  authDomain: 'studyzen-2b6f9.firebaseapp.com',
  databaseURL: 'https://studyzen-2b6f9-default-rtdb.firebaseio.com',
  projectId: 'studyzen-2b6f9',
  storageBucket: 'studyzen-2b6f9.firebasestorage.app',
  messagingSenderId: '657475575172',
  appId: '1:657475575172:web:e4b4d8658933f626fa91d1',
  measurementId: 'G-B6JYN01M8Y',
};

const app = initializeApp(firebaseConfig);

// Use browserLocalPersistence so session survives refresh on web
let auth;
try {
  auth = initializeAuth(app, { persistence: browserLocalPersistence });
} catch {
  auth = getAuth(app); // fallback if already initialized
}

export { auth };
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);
export default app;
