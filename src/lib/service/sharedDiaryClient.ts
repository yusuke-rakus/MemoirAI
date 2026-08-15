import { db } from "@/firebase/firebase";
import { normalizeDisplayName } from "@/constants/userProfile";
import type { Diary } from "@/types/diary/diary";
import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

type ShareResult = {
  shareId: string;
};

export type SharedDiaryResult<T> = {
  sharedDiaryId: string;
  diary: T;
};

export class SharedDiaryClient {
  static async publish(
    diary: Diary,
    displayName?: string | null,
  ): Promise<ShareResult> {
    if (!diary.uid) {
      throw new Error("Diary must contain a 'uid' field to share.");
    }
    if (!diary.id) {
      throw new Error("Diary must contain an 'id' field to share.");
    }

    const shareId = diary.id;
    const sharedDiaryRef = doc(db, "sharedDiaries", shareId);
    await setDoc(sharedDiaryRef, {
      ...diary,
      displayName: normalizeDisplayName(displayName),
      sharedAt: new Date(),
    });

    return { shareId };
  }

  static async getByShareId<T extends Record<string, unknown>>(
    shareId: string,
  ): Promise<T | null> {
    const sharedDiaryRef = doc(db, "sharedDiaries", shareId);
    const snapshot = await getDoc(sharedDiaryRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as T;
  }

  static async getByShareIds<T extends Record<string, unknown>>(
    shareIds: string[],
  ): Promise<SharedDiaryResult<T>[]> {
    const uniqueShareIds = [...new Set(shareIds)];

    if (uniqueShareIds.length === 0) {
      return [];
    }
    if (uniqueShareIds.some((shareId) => !shareId)) {
      throw new Error("shareIds must not contain an empty ID.");
    }
    if (uniqueShareIds.length > 10) {
      throw new Error("A maximum of 10 shared diary IDs can be fetched.");
    }

    const sharedDiariesQuery = query(
      collection(db, "sharedDiaries"),
      where(documentId(), "in", uniqueShareIds),
    );
    const snapshot = await getDocs(sharedDiariesQuery);

    return snapshot.docs.map((sharedDiaryDocument) => ({
      sharedDiaryId: sharedDiaryDocument.id,
      diary: sharedDiaryDocument.data() as T,
    }));
  }
}
