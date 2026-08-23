import {
  DISPLAY_NAME_MAX_LENGTH,
  normalizeDisplayName,
} from "@/constants/userProfile";
import { db } from "@/firebase/firebase";
import type { UserProfileSettings } from "@/types/userSettings";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";

const PROFILE_SETTINGS_DOC_ID = "profile";
const SHARED_DIARIES_PER_BATCH = 499;

const validateDisplayName = (displayName: string) => {
  const normalizedDisplayName = displayName.trim();

  if (
    !normalizedDisplayName ||
    normalizedDisplayName.length > DISPLAY_NAME_MAX_LENGTH
  ) {
    throw new Error("displayName must contain between 1 and 50 characters.");
  }

  return normalizedDisplayName;
};

export class UserProfileClient {
  static async getByUid(uid: string): Promise<UserProfileSettings | null> {
    if (!uid) {
      throw new Error("uid is required to fetch user profile settings.");
    }

    const profileRef = doc(
      db,
      "users",
      uid,
      "settings",
      PROFILE_SETTINGS_DOC_ID,
    );
    const snapshot = await getDoc(profileRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as UserProfileSettings;
  }

  static async initialize(uid: string, displayName?: string | null) {
    if (!uid) {
      throw new Error("uid is required to initialize user profile settings.");
    }

    const now = new Date();
    const profileRef = doc(
      db,
      "users",
      uid,
      "settings",
      PROFILE_SETTINGS_DOC_ID,
    );
    const currentProfile = await getDoc(profileRef);
    if (currentProfile.exists()) return;

    await setDoc(
      profileRef,
      {
        uid,
        displayName: normalizeDisplayName(displayName),
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );
  }

  static async updateDisplayName(uid: string, displayName: string) {
    if (!uid) {
      throw new Error("uid is required to update user profile settings.");
    }

    const normalizedDisplayName = validateDisplayName(displayName);
    const profileRef = doc(
      db,
      "users",
      uid,
      "settings",
      PROFILE_SETTINGS_DOC_ID,
    );
    const sharedDiariesQuery = query(
      collection(db, "sharedDiaries"),
      where("uid", "==", uid),
    );
    const [profileSnapshot, sharedDiariesSnapshot] = await Promise.all([
      getDoc(profileRef),
      getDocs(sharedDiariesQuery),
    ]);
    const sharedDiaryRefs = sharedDiariesSnapshot.docs.map(
      (snapshot) => snapshot.ref,
    );
    const chunks = Array.from(
      {
        length: Math.max(
          1,
          Math.ceil(sharedDiaryRefs.length / SHARED_DIARIES_PER_BATCH),
        ),
      },
      (_, index) =>
        sharedDiaryRefs.slice(
          index * SHARED_DIARIES_PER_BATCH,
          (index + 1) * SHARED_DIARIES_PER_BATCH,
        ),
    );

    for (const [index, refs] of chunks.entries()) {
      const batch = writeBatch(db);
      refs.forEach((sharedDiaryRef) => {
        batch.update(sharedDiaryRef, { displayName: normalizedDisplayName });
      });

      if (index === chunks.length - 1) {
        const now = new Date();
        batch.set(
          profileRef,
          {
            uid,
            displayName: normalizedDisplayName,
            updatedAt: now,
            ...(!profileSnapshot.exists() && { createdAt: now }),
          },
          { merge: true },
        );
      }

      await batch.commit();
    }
  }
}
