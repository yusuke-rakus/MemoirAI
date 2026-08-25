import { PATHS } from "@/constants/path";
import { defaultLocalUser, useLocalUser } from "@/contexts/LocalUserContext";
import { AccountDeletionClient } from "@/lib/service/accountDeletionClient";
import { clearPrimaryColorOverrides } from "@/hooks/usePrimaryColor";
import { FirebaseError } from "firebase/app";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type UseDeleteAccountOptions = {
  uid?: string;
  onDeleted: () => void;
};

const getDeletionErrorMessage = (error: unknown) => {
  if (error instanceof FirebaseError) {
    if (
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      return "本人確認がキャンセルされました";
    }
    if (error.code === "auth/popup-blocked") {
      return "Googleの本人確認ポップアップを開けませんでした";
    }
  }

  return "アカウントを削除できませんでした。通信状態を確認して再試行してください";
};

export const useDeleteAccount = ({
  uid,
  onDeleted,
}: UseDeleteAccountOptions) => {
  const { setLocalUser } = useLocalUser();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deletionInProgressRef = useRef(false);

  const setDeleteDialogOpen = (open: boolean) => {
    if (isDeleting) return;
    setIsDeleteDialogOpen(open);
  };

  const deleteAccount = async () => {
    if (!uid || deletionInProgressRef.current) return;

    deletionInProgressRef.current = true;
    setIsDeleting(true);
    try {
      await AccountDeletionClient.deleteCurrentAccount(uid);
      clearPrimaryColorOverrides();
      setLocalUser(defaultLocalUser);
      setIsDeleteDialogOpen(false);
      onDeleted();
      navigate(PATHS.login.path, { replace: true });
      toast.success("アカウントを削除しました");
    } catch (error) {
      console.error("Failed to delete account", error);
      toast.error(getDeletionErrorMessage(error));
    } finally {
      deletionInProgressRef.current = false;
      setIsDeleting(false);
    }
  };

  return {
    isDeleteDialogOpen,
    isDeleting,
    setDeleteDialogOpen,
    deleteAccount,
  };
};
