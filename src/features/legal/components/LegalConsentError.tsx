import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

type LegalConsentErrorProps = {
  onRetry: () => void;
  onLogout: () => Promise<void>;
  title?: string;
  description?: string;
};

export const LegalConsentError = ({
  onRetry,
  onLogout,
  title = "同意状況を確認できませんでした",
  description = "通信状態を確認して再試行してください。確認が完了するまで、日記の内容は表示されません。",
}: LegalConsentErrorProps) => (
  <main className="flex min-h-dvh w-full items-center justify-center bg-background px-5 py-10 text-foreground">
    <div className="w-full max-w-md text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
      <div className="mt-7 flex flex-col-reverse justify-center gap-3 sm:flex-row">
        <Button type="button" variant="ghost" onClick={() => void onLogout()}>
          ログアウト
        </Button>
        <Button type="button" onClick={onRetry}>
          <RefreshCw aria-hidden="true" />
          再試行
        </Button>
      </div>
    </div>
  </main>
);
