import { env } from "@/lib/env";
import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  Schema,
} from "firebase/ai";

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

const jsonSchema = Schema.object({
  properties: {
    characters: Schema.array({
      items: Schema.object({
        properties: {
          age: Schema.number(),
          name: Schema.string(),
          species: Schema.string(),
          accessory: Schema.string(),
        },
        optionalProperties: ["accessory"],
      }),
    }),
  },
});
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, {
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: jsonSchema,
  },
  systemInstruction: "日本語で回答してください",
});

if (env.isDev) {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
}

const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, db, model };
