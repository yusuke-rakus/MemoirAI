import { useLocalUser } from "@/contexts/LocalUserContext";
import { UserSettingsClient } from "@/lib/service/userSettingsClient";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const useMarkdownEditorSetting = () => {
  const { localUser, setLocalUser } = useLocalUser();
  const [isSaving, setIsSaving] = useState(false);

  const setMarkdownEditorEnabled = useCallback(
    async (enabled: boolean) => {
      if (
        !localUser.uid ||
        isSaving ||
        enabled === localUser.markdownEditorEnabled
      ) {
        return;
      }

      const previousUser = localUser;
      setLocalUser({ ...localUser, markdownEditorEnabled: enabled });
      setIsSaving(true);

      try {
        await UserSettingsClient.update(localUser.uid, {
          markdownEditorEnabled: enabled,
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error("Failed to save Markdown editor setting", error);
        setLocalUser(previousUser);
        toast.error("Markdownエディタ設定の保存に失敗しました");
      } finally {
        setIsSaving(false);
      }
    },
    [isSaving, localUser, setLocalUser],
  );

  return {
    markdownEditorEnabled: localUser.markdownEditorEnabled,
    setMarkdownEditorEnabled,
    isSavingMarkdownEditorSetting: isSaving,
  } as const;
};
