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
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <main className="min-h-dvh w-full bg-background px-5 py-8 text-foreground sm:px-8 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-xl flex-col justify-center sm:min-h-[calc(100dvh-6rem)]">
        <div className="mb-6 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BookOpenCheck className="size-5" aria-hidden="true" />
        </div>

        <h1 className="!text-2xl leading-tight font-bold tracking-tight sm:!text-3xl">
          ご利用前にご確認ください
        </h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          利用規約と、個人情報・AIによるデータ処理についてご確認ください。
        </p>

        <section
          className="mt-8 border-y py-5"
          aria-labelledby="legal-links-title"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="mt-0.5 size-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <h2 id="legal-links-title" className="font-semibold">
                利用規約とデータの取り扱い
              </h2>
              <LegalLinks
                target="_blank"
                linkLabel="利用規約を確認（別タブ）"
                className="mt-3 gap-x-5 gap-y-3"
                linkClassName="text-sm font-medium text-primary"
              />
            </div>
          </div>
        </section>

        <Label
          htmlFor={checkboxId}
          data-disabled={isSubmitting}
          className="mt-6 cursor-pointer items-start gap-3 rounded-lg bg-muted/60 p-4 text-sm leading-6 font-normal transition-shadow has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60"
        >
          <input
            id={checkboxId}
            type="checkbox"
            checked={isConfirmed}
            disabled={isSubmitting}
            onChange={(event) => setIsConfirmed(event.target.checked)}
            className="mt-0.5 size-5 shrink-0 accent-primary focus-visible:outline-none"
          />
          <span>
            私は18歳以上です。利用規約、プライバシーポリシー、AIデータ利用方針を確認し、記載された目的での情報の取り扱いとGeminiへの送信に同意します。
          </span>
        </Label>

        {submitError && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            同意内容を保存できませんでした。通信状態を確認して、もう一度お試しください。
          </p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
