import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  motion,
  type HTMLMotionProps,
  type Transition,
} from "motion/react";
import { useRotatingText } from "./useRotatingText";

export type RotatingTextProps = {
  text: string | string[];
  duration?: number;
  transition?: Transition;
  y?: number;
  containerClassName?: string;
} & HTMLMotionProps<"div">;

export function RotatingText({
  text,
  y = -50,
  duration = 5000,
  transition = { duration: 0.5, ease: "easeOut" },
  containerClassName,
  ...props
}: RotatingTextProps) {
  const currentText = useRotatingText(text, duration);

  return (
    <div className={cn("overflow-hidden py-1", containerClassName)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentText}
          transition={transition}
          initial={{ opacity: 0, y: -y }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y }}
          {...props}
        >
          {currentText}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
