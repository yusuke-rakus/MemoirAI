import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

type ShinyTextProps = {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  color?: string;
  shineColor?: string;
  spread?: number;
  yoyo?: boolean;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  delay?: number;
};

function ShinyText({
  text,
  disabled = false,
  speed = 2,
  className,
  color = "var(--color-foreground)",
  shineColor = "var(--color-input)",
  spread = 120,
  yoyo = false,
  pauseOnHover = false,
  direction = "left",
  delay = 0,
}: ShinyTextProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isPaused, setIsPaused] = useState(false);
  const progress = useMotionValue(direction === "left" ? 0 : 100);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const directionRef = useRef(direction === "left" ? 1 : -1);
  const isDisabled = disabled || shouldReduceMotion;
  const animationDuration = speed * 1000;
  const delayDuration = delay * 1000;

  useAnimationFrame((time) => {
    if (isDisabled || isPaused) {
      lastTimeRef.current = null;
      return;
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    elapsedRef.current += deltaTime;

    const cycleDuration = animationDuration + delayDuration;
    const fullCycle = yoyo ? cycleDuration * 2 : cycleDuration;
    const cycleTime = elapsedRef.current % fullCycle;

    if (cycleTime < animationDuration) {
      const value = (cycleTime / animationDuration) * 100;
      progress.set(directionRef.current === 1 ? value : 100 - value);
      return;
    }

    if (cycleTime < cycleDuration) {
      progress.set(directionRef.current === 1 ? 100 : 0);
      return;
    }

    if (cycleTime < cycleDuration + animationDuration) {
      const reverseTime = cycleTime - cycleDuration;
      const value = 100 - (reverseTime / animationDuration) * 100;
      progress.set(directionRef.current === 1 ? value : 100 - value);
      return;
    }

    progress.set(directionRef.current === 1 ? 0 : 100);
  });

  useEffect(() => {
    directionRef.current = direction === "left" ? 1 : -1;
    elapsedRef.current = 0;
    progress.set(direction === "left" ? 0 : 100);
  }, [direction, progress]);

  const backgroundPosition = useTransform(
    progress,
    (value) => `${150 - value * 2}% center`,
  );

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  }, [pauseOnHover]);

  if (isDisabled) {
    return <span className={cn("inline-block", className)}>{text}</span>;
  }

  const gradientStyle: CSSProperties = {
    backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  return (
    <motion.span
      className={cn("inline-block", className)}
      style={{ ...gradientStyle, backgroundPosition }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {text}
    </motion.span>
  );
}

export { ShinyText };
