import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBn3RRogolaCOK34s4IXh3NzFIbK3pKS28",
  authDomain: "gchat-f2195.firebaseapp.com",
  projectId: "gchat-f2195"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdmin() {
  let user;
  try {
    console.log('Attempting to create admin...');
    const userCredential = await createUserWithEmailAndPassword(auth, "brucewayne19102005@gmail.com", "2026@devs");
    user = userCredential.user;
  } catch(e) {
    if (e.code === 'auth/email-already-in-use') {
      console.log('Account exists! Logging in...');
      const userCredential = await signInWithEmailAndPassword(auth, "brucewayne19102005@gmail.com", "2026@devs");
      user = userCredential.user;
    } else {
      console.error("AUTH ERROR:", e.message);
      process.exit(1);
    }
  }
  
  try {
    await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username: "brucewayne",
        email: "brucewayne19102005@gmail.com",
        phone: "+910000000000",
        bio: "Master Admin",
        isPrivate: false,
        role: "admin",
        createdAt: new Date().toISOString()
    });
    console.log("SUCCESS! Admin document created properly in Firestore.");
    process.exit(0);
  } catch(err) {
    console.error("FIRESTORE ERROR:", err.message);
    process.exit(1);
  }
}
createAdmin();
