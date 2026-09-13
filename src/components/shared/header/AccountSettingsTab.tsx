import { useEffect } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";

import { AccountDeleteDialog } from "./AccountDeleteDialog";
import { AccountSettingsSection } from "./AccountSettingsSection";

type AccountSettingsTabProps = {
  uid?: string;
  onDeleted: () => void;
  onDeletingChange: (isDeleting: boolean) => void;
};

export const AccountSettingsTab = ({
  uid,
  onDeleted,
  onDeletingChange,
}: AccountSettingsTabProps) => {
  const accountDeletion = useDeleteAccount({ uid, onDeleted });

  useEffect(() => {
    onDeletingChange(accountDeletion.isDeleting);
  }, [accountDeletion.isDeleting, onDeletingChange]);

  return (
    <>
      <TabsContent value="account" className="m-0 flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-b px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold">アカウント</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            アカウントと保存データを管理します。
          </p>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="px-5 py-5 sm:px-6">
            <AccountSettingsSection
              disabled={!uid || accountDeletion.isDeleting}
              onDelete={() => accountDeletion.setDeleteDialogOpen(true)}
            />
          </div>
        </ScrollArea>
      </TabsContent>
      <AccountDeleteDialog
        open={accountDeletion.isDeleteDialogOpen}
        isDeleting={accountDeletion.isDeleting}
        onOpenChange={accountDeletion.setDeleteDialogOpen}
        onDelete={() => void accountDeletion.deleteAccount()}
      />
    </>
  );
};
