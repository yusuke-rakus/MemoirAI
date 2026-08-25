import { auth, provider } from "@/firebase/firebase";
import { deleteUser, reauthenticateWithPopup } from "firebase/auth";
import { DiaryDraftClient } from "./diaryDraftClient";
import { UserAccountDataClient } from "./userAccountDataClient";
import { UserStorageClient } from "./userStorageClient";

export class AccountDeletionClient {
  static async deleteCurrentAccount(expectedUid: string): Promise<void> {
    if (!expectedUid) {
      throw new Error("uid is required to delete an account.");
    }

    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== expectedUid) {
      throw new Error(
        "Authenticated user does not match the requested account.",
      );
    }

    const credential = await reauthenticateWithPopup(currentUser, provider);
    if (
      credential.user.uid !== expectedUid ||
      auth.currentUser?.uid !== expectedUid
    ) {
      throw new Error(
        "Reauthenticated user does not match the requested account.",
      );
    }

    await DiaryDraftClient.clearAllByUid(expectedUid);
    await UserStorageClient.deleteAllByUid(expectedUid);
    await UserAccountDataClient.deleteSharedDiaries(expectedUid);
    await UserAccountDataClient.deletePrivateData(expectedUid);
    await UserAccountDataClient.retainLegalAcceptances(expectedUid);

    const userToDelete = auth.currentUser;
    if (!userToDelete || userToDelete.uid !== expectedUid) {
      throw new Error("Authenticated user changed during account deletion.");
    }

    await deleteUser(userToDelete);
  }
}
