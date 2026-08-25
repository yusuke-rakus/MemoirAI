import { storage } from "@/firebase/firebase";
import {
  deleteObject,
  list,
  ref,
  type StorageReference,
} from "firebase/storage";

const STORAGE_LIST_PAGE_SIZE = 1000;

const deleteFolder = async (folder: StorageReference): Promise<void> => {
  let pageToken: string | undefined;

  do {
    const result = await list(folder, {
      maxResults: STORAGE_LIST_PAGE_SIZE,
      pageToken,
    });

    await Promise.all(result.items.map((item) => deleteObject(item)));
    for (const prefix of result.prefixes) {
      await deleteFolder(prefix);
    }

    pageToken = result.nextPageToken;
  } while (pageToken);
};

export class UserStorageClient {
  static async deleteAllByUid(uid: string): Promise<void> {
    if (!uid) {
      throw new Error("uid is required to delete user storage.");
    }

    await deleteFolder(ref(storage, `users/${uid}`));
  }
}
