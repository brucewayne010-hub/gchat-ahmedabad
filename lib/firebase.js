import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBn3RRogolaCOK34s4IXh3NzFIbK3pKS28",
  authDomain: "gchat-f2195.firebaseapp.com",
  projectId: "gchat-f2195",
  storageBucket: "gchat-f2195.firebasestorage.app",
  messagingSenderId: "336127353681",
  appId: "1:336127353681:web:f37154c6477ea3a153a970",
  measurementId: "G-JGT0M6VXEX",
  databaseURL: "https://gchat-f2195-default-rtdb.asia-southeast1.firebasedatabase.app" // Standard default rtdb url
};

// Initialize Firebase only if it hasn't been initialized
let app, auth, db, storage, rtdb;
try {
  if (firebaseConfig.apiKey) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    rtdb = getDatabase(app);
  }
} catch (err) {
  console.warn('Firebase initialization delayed due to missing keys.');
}

export { app, auth, db, storage, rtdb };

export default app;
