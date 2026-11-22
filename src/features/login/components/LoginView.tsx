import { ArrowDown, ArrowRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { FadeContent } from "@/components/ui/fade-content";
import { PATHS } from "@/constants/path";
import { LegalLinks } from "@/features/legal/components/LegalLinks";

import walterDiary from "../assets/walter-diary.webp";
import walterMemo from "../assets/walter-memo.webp";
import { DiaryBrowsePreview } from "./DiaryBrowsePreview";

const PixelBlast = lazy(
  () => import("@/components/shared/background/PixelBlast"),
);

export const LoginView = () => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <div className="relative isolate flex min-h-[calc(100svh-3.5rem)] flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_25%,var(--color-purple-400)_0%,transparent_65%),radial-gradient(ellipse_at_85%_75%,var(--color-pink-400)_0%,transparent_65%)] opacity-20"
      />
      {!shouldReduceMotion && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-[31rem] overflow-hidden [mask-image:linear-gradient(black_55%,transparent)]"
        >
          <Suspense fallback={null}>
            <PixelBlast
              variant="circle"
              pixelSize={6}
              patternScale={3}
              patternDensity={1.2}
              edgeFade={0.05}
              transparent
            />
          </Suspense>
        </div>
      )}

      <div className="px-3 pt-7 pb-8 text-center sm:pt-9 sm:pb-10">
        <h1 className="font-extrabold tracking-tighter">
          <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Memoir AI
          </span>
        </h1>

        <h2 className="mt-4 text-xl leading-relaxed font-medium tracking-wide sm:text-2xl md:text-3xl">
          1日を、いくつものメモで
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
          書きたいことを、書きたい順に。
        </p>

        <Button asChild className="mt-5 h-11 rounded-full px-5">
          <Link to={PATHS.guestDiary.path}>
            ログインせずに試す
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <FadeContent className="mx-auto w-full max-w-3xl px-3">
        <section
          aria-label="Walterさんの日記の作例"
          className="grid items-start gap-3 rounded-2xl border border-border/80 bg-background/80 p-3 shadow-sm backdrop-blur-md sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-4 sm:p-4"
        >
          <figure className="min-w-0">
            <figcaption className="px-1 pb-2 text-sm font-medium">
              思い出したことをメモする
            </figcaption>
            <img
              className="block h-auto w-full rounded-lg border border-border"
              src={walterMemo}
              width={390}
              height={384}
              alt="Walterさんのメモ。夕方、鴨川を散歩した。水面がきらきらしていて、少し遠回りして帰った。"
            />
          </figure>

          <ArrowRight
            aria-hidden="true"
            className="hidden size-4 self-center text-muted-foreground sm:block"
          />
          <ArrowDown
            aria-hidden="true"
            className="mx-auto size-4 text-muted-foreground sm:hidden"
          />

          <figure className="min-w-0">
            <figcaption className="px-1 pb-2 text-sm font-medium">
              AIがタイトルとタグをつける
            </figcaption>
            <img
              className="block h-auto w-full rounded-lg border border-border"
              src={walterDiary}
              width={390}
              height={316}
              alt="Walterさんの保存後の日記。タイトルは「鴨川の光、秋の散歩」、タグは「散歩」「鴨川」「秋」。"
            />
          </figure>
        </section>
      </FadeContent>

      <DiaryBrowsePreview />

      <LegalLinks
        className="mt-auto justify-center gap-x-4 gap-y-2 px-4 pt-7 pb-5"
        linkClassName="text-xs text-muted-foreground"
      />
    </div>
  );
};
