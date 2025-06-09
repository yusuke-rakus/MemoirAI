import { db } from "@/firebase/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export class DiaryClient {
  private static collectionPath = "diaries";

  private static generateDiaryID(): string {
    return uuidv4();
  }

  static async getByUid<T extends Record<string, any>>(
    uid: string
  ): Promise<T[] | null> {
    const q = query(
      collection(db, this.collectionPath),
      where("uid", "==", uid)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs.map((doc) => doc.data() as T);
  }

  static async add<T extends Record<string, any>>(data: T): Promise<void> {
    const id = this.generateDiaryID();
    await setDoc(doc(db, this.collectionPath, id), data);
  }

  static async update<T extends Record<string, any>>(data: T): Promise<void> {
    if (!data.id) {
      throw new Error("Data must contain an 'id' field to update.");
    }
    await setDoc(doc(db, this.collectionPath, data.id), data);
  }
}
