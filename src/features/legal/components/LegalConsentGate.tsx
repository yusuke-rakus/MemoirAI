import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BookOpenCheck, LogOut, ShieldCheck } from "lucide-react";
import { useId, useState } from "react";
import { LegalLinks } from "./LegalLinks";

type LegalConsentGateProps = {
  isSubmitting: boolean;
  submitError: boolean;
  onAccept: () => Promise<void>;
  onLogout: () => Promise<void>;
};

export const LegalConsentGate = ({
  isSubmitting,
  submitError,
  onAccept,
  onLogout,
}: LegalConsentGateProps) => {
  const checkboxId = useId();
  const descriptionId = useId();
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <main className="min-h-dvh w-full bg-background px-5 py-10 text-foreground sm:px-8 sm:py-16">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-2xl flex-col justify-center">
        <div className="mb-8 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BookOpenCheck className="size-5" aria-hidden="true" />
        </div>

        <p className="text-sm font-medium tracking-wide text-primary">
          初回のみご確認ください
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          MemoirAIを安心してお使いいただくために
        </h1>
        <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
          日記とプロフィール情報の取扱い、AIによる処理についてご確認ください。同意内容は保存され、通常のログインでは再表示されません。
        </p>

        <section
          className="mt-10 border-y py-6"
          aria-labelledby="legal-links-title"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="mt-0.5 size-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <h2 id="legal-links-title" className="font-semibold">
                ご確認いただく文書
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                利用規約は別のタブで開きます。プライバシーポリシーとAIデータ利用方針も同じページで確認できます。
              </p>
              <LegalLinks
                target="_blank"
                className="mt-4 gap-x-5 gap-y-3"
                linkClassName="text-sm font-medium text-primary"
              />
            </div>
          </div>
        </section>

        <div className="mt-7 rounded-lg bg-muted/60 p-4">
          <div className="flex items-start gap-3">
            <input
              id={checkboxId}
              type="checkbox"
              checked={isConfirmed}
              disabled={isSubmitting}
              aria-describedby={descriptionId}
              onChange={(event) => setIsConfirmed(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            />
            <Label
              htmlFor={checkboxId}
              id={descriptionId}
              className="block cursor-pointer text-sm leading-6 font-normal"
            >
              私は18歳以上であり、利用規約に同意します。また、プライバシーポリシーとAIデータ利用方針を確認し、日記・プロフィール・記憶情報が記載された目的で取り扱われ、Geminiへ送信されることに同意します。
            </Label>
          </div>
        </div>

        {submitError && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            同意内容を保存できませんでした。通信状態を確認して、もう一度お試しください。
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={() => void onLogout()}
          >
            <LogOut aria-hidden="true" />
            ログアウト
          </Button>
          <Button
            type="button"
            size="lg"
            disabled={!isConfirmed || isSubmitting}
            aria-busy={isSubmitting}
            onClick={() => void onAccept()}
          >
            {isSubmitting ? "保存中..." : "同意して利用を開始"}
          </Button>
        </div>
      </div>
    </main>
  );
};
