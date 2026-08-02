import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PanelLeft, PanelLeftOpen } from "lucide-react";
import * as React from "react";

type SidebarToggleButtonProps = {
  isOpen: boolean;
  onToggle: () => void;
} & Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  "onClick" | "size" | "variant"
>;

export const SidebarToggleButton = React.forwardRef<
  HTMLButtonElement,
  SidebarToggleButtonProps
>((props, ref) => {
  const { isOpen, onToggle, className, ...buttonProps } = props;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      aria-label={isOpen ? "ナビゲーションを閉じる" : "ナビゲーションを開く"}
      title={isOpen ? "ナビゲーションを閉じる" : "ナビゲーションを開く"}
      {...buttonProps}
      onClick={onToggle}
      className={cn("size-11 rounded-full sm:size-9", className)}
    >
      {isOpen ? (
        <PanelLeft className="h-5 w-5" />
      ) : (
        <PanelLeftOpen className="h-5 w-5" />
      )}
    </Button>
  );
});

SidebarToggleButton.displayName = "SidebarToggleButton";
