import { db } from "@/firebase/firebase";
import type { Diary } from "@/types/diary/diary";
import { doc, getDoc, setDoc } from "firebase/firestore";

type ShareResult = {
  shareId: string;
};

export class SharedDiaryClient {
  static async publish(diary: Diary): Promise<ShareResult> {
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
}
