import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type AnimatedContentProps = {
  children: ReactNode;
  className?: string;
};

export const AnimatedContent = ({
  children,
  className,
}: AnimatedContentProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};
