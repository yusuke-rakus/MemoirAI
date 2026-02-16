import { db } from "@/firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const USER_SETTINGS_DOC_ID = "appearance";

export class UserSettingsClient {
  static async getByUid<T extends Record<string, unknown>>(
    uid: string,
  ): Promise<T | null> {
    if (!uid) {
      throw new Error("uid is required to fetch user settings.");
    }

    const settingsRef = doc(db, "users", uid, "settings", USER_SETTINGS_DOC_ID);
    const snapshot = await getDoc(settingsRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as T;
  }

  static async update<T extends Record<string, unknown>>(
    uid: string,
    data: T,
  ): Promise<void> {
    if (!uid) {
      throw new Error("uid is required to update user settings.");
    }

    const settingsRef = doc(db, "users", uid, "settings", USER_SETTINGS_DOC_ID);
    await setDoc(
      settingsRef,
      {
        uid,
        ...data,
      },
      { merge: true },
    );
  }
}
