import { env } from "@/lib/env";
import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: env.apiKey,
  authDomain: env.authDomain,
  projectId: env.projectId,
  storageBucket: env.storageBucket,
  messagingSenderId: env.messagingSenderId,
  appId: env.appId,
  measurementId: env.measurementId,
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);
const storage = getStorage(app);

if (env.isDev) {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
}

const provider = new GoogleAuthProvider();

export { app, auth, db, provider, signInWithPopup, storage };
