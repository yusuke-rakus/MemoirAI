import { db } from "@/firebase/firebase";
import {
  collection,
  deleteDoc,
  doc,
  type DocumentData,
  getDocs,
  limit,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";

export class DiaryClient {
  static async getByUid<T extends DocumentData>(
    uid: string,
  ): Promise<T[] | null> {
    const q = query(
      collection(db, "users", uid, "diaries"),
      where("uid", "==", uid),
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs.map((doc) => doc.data() as T);
  }

  static async getByUidAndDate<T extends DocumentData>(
    uid: string,
    date: Date,
  ): Promise<T[] | null> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const q = query(
      collection(db, "users", uid, "diaries"),
      where("date", ">=", Timestamp.fromDate(start)),
      where("date", "<", Timestamp.fromDate(end)),
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    return querySnapshot.docs.map((doc) => doc.data() as T);
  }

  static async getByUidPaged<T extends DocumentData>(
    uid: string,
  ): Promise<T[] | null> {
    const q = query(collection(db, "users", uid, "diaries"), limit(10));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    return querySnapshot.docs.map((doc) => doc.data() as T);
  }

  static async getByUidAndMonth<T extends DocumentData>(
    uid: string,
    year: number,
    month: number,
  ): Promise<T[] | null> {
    const m = Math.max(1, Math.min(12, Math.floor(month)));
    const start = new Date(year, m - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, m, 1, 0, 0, 0, 0);

    const q = query(
      collection(db, "users", uid, "diaries"),
      where("date", ">=", Timestamp.fromDate(start)),
      where("date", "<", Timestamp.fromDate(end)),
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    return querySnapshot.docs.map((doc) => doc.data() as T);
  }

  static async add<T extends DocumentData & { id: string; uid: string }>(
    data: T,
  ): Promise<void> {
    const id = data.id;

    if (!data.uid) {
      throw new Error("Data must contain a 'uid' field to add.");
    }

    await setDoc(doc(db, "users", data.uid, "diaries", id), data);
  }

  static async update<T extends DocumentData & { id: string; uid: string }>(
    data: T,
  ): Promise<void> {
    if (!data.id) {
      throw new Error("Data must contain an 'id' field to update.");
    }
    if (!data.uid) {
      throw new Error("Data must contain a 'uid' field to update.");
    }
    await setDoc(doc(db, "users", data.uid, "diaries", data.id), data, {
      merge: true,
    });
  }

  static async delete(uid: string, id: string): Promise<void> {
    if (!uid) {
      throw new Error("uid is required to delete a diary.");
    }
    if (!id) {
      throw new Error("id is required to delete a diary.");
    }

    await deleteDoc(doc(db, "users", uid, "diaries", id));
  }
}
