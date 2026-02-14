import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SquarePen } from "lucide-react";
import * as React from "react";

type SidebarPenButtonProps = {
  onToggle: () => void;
} & Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  "onClick" | "size" | "variant"
>;

export const SidebarPenButton = React.forwardRef<
  HTMLButtonElement,
  SidebarPenButtonProps
>((props, ref) => {
  const { onToggle, className, ...buttonProps } = props;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      {...buttonProps}
      onClick={onToggle}
      className={cn("rounded-full", className)}
    >
      <SquarePen className="h-5 w-5" />
    </Button>
  );
});

SidebarPenButton.displayName = "SidebarPenButton";
