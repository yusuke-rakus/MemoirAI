import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type FadeContentProps = {
  children: ReactNode;
  className?: string;
};

export const FadeContent = ({ children, className }: FadeContentProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};
