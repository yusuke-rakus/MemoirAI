import { db } from "@/firebase/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
  type CollectionReference,
  type DocumentData,
  type Query,
} from "firebase/firestore";

const DELETE_BATCH_SIZE = 450;
const LEGAL_RETENTION_YEARS = 5;

const PRIVATE_COLLECTION_PATHS = [
  ["diaries"],
  ["favorites"],
  ["settings", "memory", "profileFacts"],
  ["settings", "memory", "preferences"],
  ["settings", "memory", "people"],
] as const;

const deleteQueryInBatches = async (
  createQuery: () => Query<DocumentData>,
): Promise<void> => {
  while (true) {
    const snapshot = await getDocs(createQuery());
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((document) => batch.delete(document.ref));
    await batch.commit();
  }
};

const userCollection = (
  uid: string,
  segments: readonly string[],
): CollectionReference<DocumentData> =>
  collection(db, "users", uid, ...segments);

const getRetentionExpiry = (deletedAt: Date) => {
  const expiry = new Date(deletedAt);
  expiry.setUTCFullYear(expiry.getUTCFullYear() + LEGAL_RETENTION_YEARS);
  return Timestamp.fromDate(expiry);
};

export class UserAccountDataClient {
  static async deleteSharedDiaries(uid: string): Promise<void> {
    if (!uid) {
      throw new Error("uid is required to delete shared diaries.");
    }

    await deleteQueryInBatches(() =>
      query(
        collection(db, "sharedDiaries"),
        where("uid", "==", uid),
        limit(DELETE_BATCH_SIZE),
      ),
    );
  }

  static async deletePrivateData(uid: string): Promise<void> {
    if (!uid) {
      throw new Error("uid is required to delete private user data.");
    }

    for (const path of PRIVATE_COLLECTION_PATHS) {
      const target = userCollection(uid, path);
      await deleteQueryInBatches(() => query(target, limit(DELETE_BATCH_SIZE)));
    }

    await Promise.all([
      deleteDoc(doc(db, "users", uid, "settings", "appearance")),
      deleteDoc(doc(db, "users", uid, "settings", "profile")),
      deleteDoc(doc(db, "users", uid, "settings", "memory")),
      deleteDoc(doc(db, "users", uid)),
    ]);
  }

  static async retainLegalAcceptances(uid: string): Promise<void> {
    if (!uid) {
      throw new Error("uid is required to retain legal acceptances.");
    }

    const snapshot = await getDocs(userCollection(uid, ["legalAcceptances"]));
    const documentsToUpdate = snapshot.docs.filter((document) => {
      const data = document.data();
      return !("accountDeletedAt" in data) && !("retentionExpiresAt" in data);
    });

    const deletedAt = new Date();
    const retentionExpiresAt = getRetentionExpiry(deletedAt);

    for (
      let index = 0;
      index < documentsToUpdate.length;
      index += DELETE_BATCH_SIZE
    ) {
      const batch = writeBatch(db);
      documentsToUpdate
        .slice(index, index + DELETE_BATCH_SIZE)
        .forEach((document) => {
          batch.update(document.ref, {
            accountDeletedAt: serverTimestamp(),
            retentionExpiresAt,
          });
        });
      await batch.commit();
    }
  }
}
