import { useReducedMotion } from "motion/react";
import { lazy, Suspense } from "react";

import { LegalLinks } from "@/features/legal/components/LegalLinks";

const PixelBlast = lazy(
  () => import("@/components/shared/background/PixelBlast"),
);

export const LoginView = () => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <div>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_15%_25%,var(--color-purple-400)_0%,transparent_65%),radial-gradient(ellipse_at_85%_75%,var(--color-pink-400)_0%,transparent_65%)] opacity-20"
      />
      <div className="relative h-full min-h-[500px] w-full overflow-hidden text-foreground">
        <div className="absolute inset-0 z-0">
          <Suspense fallback={null}>
            <PixelBlast
              variant="circle"
              pixelSize={6}
              patternScale={3}
              patternDensity={1.2}
              edgeFade={0.05}
              enableRipples={!shouldReduceMotion}
              // liquid={!shouldReduceMotion}
              transparent
            />
          </Suspense>
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center p-6 text-center">
          <div className="max-w-3xl space-y-8">
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Memoir AI
              </span>
            </h1>

            <h2 className="text-xl leading-relaxed font-medium tracking-wide text-foreground sm:text-2xl md:text-3xl">
              1日を、いくつものメモで
            </h2>

            <p className="mx-auto max-w-lg text-base text-muted-foreground sm:text-lg">
              書きたいことを、書きたい順に。
              <br className="hidden sm:inline" />
              An AI journal built for fragmented days.
            </p>
          </div>
        </div>
      </div>
      <LegalLinks
        className="absolute right-4 bottom-4 left-4 z-10 justify-center gap-x-4 gap-y-2"
        linkClassName="text-xs text-muted-foreground"
      />
    </div>
  );
};
