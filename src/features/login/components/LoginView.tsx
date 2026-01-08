import PixelBlast from "@/components/shared/background/pixelBlast";

export const LoginView = () => {
  return (
    <div className="relative w-full overflow-hidden text-white h-[500px]">
      <div className="absolute inset-0 z-0">
        <PixelBlast
          variant="circle"
          color="#1f2937"
          pixelSize={6}
          patternScale={3}
          patternDensity={1.2}
          enableRipples
          liquid
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

          <h2 className="text-xl font-medium leading-relaxed tracking-wide text-gray-200 sm:text-2xl md:text-3xl">
            1日を、いくつものメモで。
          </h2>

          <p className="mx-auto max-w-lg text-base text-gray-400 sm:text-lg">
            書きたいことを、書きたい順に。
            <br className="hidden sm:inline" />
            An AI journal built for fragmented days.
          </p>
        </div>
      </div>
    </div>
  );
};
