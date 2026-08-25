import { Button } from "@/components/ui/button";

type AccountSettingsSectionProps = {
  disabled: boolean;
  onDelete: () => void;
};

export const AccountSettingsSection = ({
  disabled,
  onDelete,
}: AccountSettingsSectionProps) => (
  <section>
    <h3 className="text-sm font-semibold">アカウントの削除</h3>
    <p className="mt-1 text-sm text-muted-foreground">
      アカウントと保存データを削除します。
    </p>
    <div className="mt-3 flex justify-end">
      <Button
        type="button"
        variant="destructive"
        disabled={disabled}
        onClick={onDelete}
      >
        アカウントを削除
      </Button>
    </div>
  </section>
);
