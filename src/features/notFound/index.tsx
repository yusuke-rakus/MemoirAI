import { Button } from "@/components/ui/button";
import { PATHS } from "@/constants/path";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { House, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  useDocumentTitle("ページが見つかりません");

  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-background px-6 py-16"
      aria-labelledby="not-found-title"
    >
      <div className="flex max-w-lg flex-col items-center text-center">
        <p className="text-sm font-medium tracking-[0.24em] text-muted-foreground">
          ERROR 404
        </p>
        <p
          aria-hidden="true"
          className="mt-3 text-8xl font-bold tracking-tighter text-muted sm:text-9xl"
        >
          404
        </p>
        <h1
          id="not-found-title"
          className="mt-6 !text-3xl font-semibold tracking-tight sm:!text-4xl"
        >
          ページが見つかりません
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          URLをご確認いただくか、ホームまたはログイン画面からお進みください。
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link to={PATHS.calendar.path}>
              <House />
              ホームへ戻る
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={PATHS.login.path}>
              <LogIn />
              ログイン画面へ
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
};
