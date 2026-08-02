import PixelBlast from "@/components/shared/background/pixelBlast";
import { useReducedMotion } from "motion/react";

export const LoginView = () => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <div className="relative h-[500px] w-full overflow-hidden text-foreground">
      <div className="absolute inset-0 z-0">
        <PixelBlast
          variant="circle"
          color="#1f2937"
          pixelSize={6}
          patternScale={3}
          patternDensity={1.2}
          enableRipples={!shouldReduceMotion}
          liquid={!shouldReduceMotion}
          transparent
        />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl space-y-8 animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10">
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Memoir AI
            </span>
          </h1>

          <h2 className="text-xl font-medium leading-relaxed tracking-wide text-foreground sm:text-2xl md:text-3xl">
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
  );
};
