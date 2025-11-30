import { db } from "@/firebase/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  Timestamp,
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

  static async getByUidAndDate<T extends Record<string, any>>(
    uid: string,
    date: Date
  ): Promise<T[] | null> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const q = query(
      collection(db, this.collectionPath),
      where("uid", "==", uid),
      where("date", ">=", Timestamp.fromDate(start)),
      where("date", "<", Timestamp.fromDate(end))
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    return querySnapshot.docs.map((doc) => doc.data() as T);
  }

  static async getByUidAndMonth<T extends Record<string, any>>(
    uid: string,
    year: number,
    month: number
  ): Promise<T[] | null> {
    const m = Math.max(1, Math.min(12, Math.floor(month)));
    const start = new Date(year, m - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, m, 1, 0, 0, 0, 0);

    const q = query(
      collection(db, this.collectionPath),
      where("uid", "==", uid),
      where("date", ">=", Timestamp.fromDate(start)),
      where("date", "<", Timestamp.fromDate(end))
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

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
