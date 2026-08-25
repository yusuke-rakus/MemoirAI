import { Button } from "@/components/ui/button";
import { ShieldCheck, Trash2 } from "lucide-react";

type AccountSettingsSectionProps = {
  disabled: boolean;
  onDelete: () => void;
};

export const AccountSettingsSection = ({
  disabled,
  onDelete,
}: AccountSettingsSectionProps) => (
  <section className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
    <div className="flex items-center gap-2 text-destructive">
      <Trash2 className="size-4" />
      <h3 className="text-sm font-semibold">アカウントの削除</h3>
    </div>
    <p className="mt-2 text-sm text-muted-foreground">
      日記、画像、プロフィール、設定、AIメモリ、共有コピーを削除します。この操作は取り消せません。
    </p>
    <div className="mt-4 rounded-md border bg-background p-3">
      <div className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-5 text-muted-foreground">
          契約・紛争対応のため、同意した文書のバージョンと同意日時など必要最小限の契約同意記録のみ、アカウント削除後5年間保持します。
        </p>
      </div>
    </div>
    <Button
      type="button"
      variant="destructive"
      className="mt-4"
      disabled={disabled}
      onClick={onDelete}
    >
      アカウントを削除
    </Button>
  </section>
);
