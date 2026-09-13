import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/firebase/firebase";
import { getUserMemoryUpdates } from "@/lib/userMemoryMerge";
import type {
  ActiveUserMemoryContext,
  ExtractedUserMemory,
  PersonMemory,
  UserMemoryFact,
  UserProfileMemoryFact,
} from "@/types/memory";

const MEMORY_SETTINGS_DOC_ID = "memory";
const PEOPLE_COLLECTION_ID = "people";
const PREFERENCES_COLLECTION_ID = "preferences";
const PROFILE_FACTS_COLLECTION_ID = "profileFacts";

export class UserMemoryClient {
  private static async getMemoryCollection<T>(
    uid: string,
    collectionId: string,
    errorMessage: string,
  ): Promise<T[]> {
    if (!uid) {
      throw new Error(errorMessage);
    }

    const collectionRef = collection(
      db,
      "users",
      uid,
      "settings",
      MEMORY_SETTINGS_DOC_ID,
      collectionId,
    );
    const snapshot = await getDocs(collectionRef);

    return snapshot.docs.map((document) => document.data() as T);
  }

  static async getPeople(uid: string): Promise<PersonMemory[]> {
    return UserMemoryClient.getMemoryCollection<PersonMemory>(
      uid,
      PEOPLE_COLLECTION_ID,
      "uid is required to fetch people memory.",
    );
  }

  static async getProfileFacts(uid: string): Promise<UserProfileMemoryFact[]> {
    return UserMemoryClient.getMemoryCollection<UserProfileMemoryFact>(
      uid,
      PROFILE_FACTS_COLLECTION_ID,
      "uid is required to fetch profile memory.",
    );
  }

  static async getPreferences(uid: string): Promise<UserMemoryFact[]> {
    return UserMemoryClient.getMemoryCollection<UserMemoryFact>(
      uid,
      PREFERENCES_COLLECTION_ID,
      "uid is required to fetch preference memory.",
    );
  }

  static async updateProfileFact(
    uid: string,
    fact: UserProfileMemoryFact,
  ): Promise<void> {
    await setDoc(
      doc(
        db,
        "users",
        uid,
        "settings",
        MEMORY_SETTINGS_DOC_ID,
        PROFILE_FACTS_COLLECTION_ID,
        fact.id,
      ),
      fact,
    );
  }

  static async deleteProfileFact(uid: string, id: string): Promise<void> {
    await deleteDoc(
      doc(
        db,
        "users",
        uid,
        "settings",
        MEMORY_SETTINGS_DOC_ID,
        PROFILE_FACTS_COLLECTION_ID,
        id,
      ),
    );
  }

  static async updatePreference(
    uid: string,
    fact: UserMemoryFact,
  ): Promise<void> {
    await setDoc(
      doc(
        db,
        "users",
        uid,
        "settings",
        MEMORY_SETTINGS_DOC_ID,
        PREFERENCES_COLLECTION_ID,
        fact.id,
      ),
      fact,
    );
  }

  static async deletePreference(uid: string, id: string): Promise<void> {
    await deleteDoc(
      doc(
        db,
        "users",
        uid,
        "settings",
        MEMORY_SETTINGS_DOC_ID,
        PREFERENCES_COLLECTION_ID,
        id,
      ),
    );
  }

  static async updatePerson(uid: string, person: PersonMemory): Promise<void> {
    await setDoc(
      doc(
        db,
        "users",
        uid,
        "settings",
        MEMORY_SETTINGS_DOC_ID,
        PEOPLE_COLLECTION_ID,
        person.id,
      ),
      person,
    );
  }

  static async deletePerson(uid: string, id: string): Promise<void> {
    await deleteDoc(
      doc(
        db,
        "users",
        uid,
        "settings",
        MEMORY_SETTINGS_DOC_ID,
        PEOPLE_COLLECTION_ID,
        id,
      ),
    );
  }

  static async getActiveMemoryContext(
    uid: string,
  ): Promise<ActiveUserMemoryContext> {
    if (!uid) {
      throw new Error("uid is required to fetch active user memory.");
    }

    const [profileFacts, preferences, people] = await Promise.all([
      UserMemoryClient.getProfileFacts(uid),
      UserMemoryClient.getPreferences(uid),
      UserMemoryClient.getPeople(uid),
    ]);

    return {
      profileFacts,
      preferences,
      people: people.filter(
        (person) =>
          person.relationshipToUser ||
          person.attributes.length > 0 ||
          person.relationshipNotes.length > 0,
      ),
    };
  }

  static async mergeExtractedMemory({
    uid,
    extracted,
  }: {
    uid: string;
    extracted: ExtractedUserMemory;
  }): Promise<void> {
    if (!uid) {
      throw new Error("uid is required to update user memory.");
    }

    const [profileFacts, preferences, people] = await Promise.all([
      UserMemoryClient.getProfileFacts(uid),
      UserMemoryClient.getPreferences(uid),
      UserMemoryClient.getPeople(uid),
    ]);
    const updates = getUserMemoryUpdates(
      { profileFacts, preferences, people },
      extracted,
    );
    const writeCount =
      updates.profileFacts.length +
      updates.preferences.length +
      updates.people.length;
    if (writeCount === 0) return;

    const batch = writeBatch(db);

    updates.profileFacts.forEach((profileFact) => {
      batch.set(
        doc(
          db,
          "users",
          uid,
          "settings",
          MEMORY_SETTINGS_DOC_ID,
          PROFILE_FACTS_COLLECTION_ID,
          profileFact.id,
        ),
        profileFact,
      );
    });

    updates.preferences.forEach((preference) => {
      batch.set(
        doc(
          db,
          "users",
          uid,
          "settings",
          MEMORY_SETTINGS_DOC_ID,
          PREFERENCES_COLLECTION_ID,
          preference.id,
        ),
        preference,
      );
    });

    updates.people.forEach((person) => {
      batch.set(
        doc(
          db,
          "users",
          uid,
          "settings",
          MEMORY_SETTINGS_DOC_ID,
          PEOPLE_COLLECTION_ID,
          person.id,
        ),
        person,
      );
    });

    await batch.commit();
  }
}
