import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import * as React from "react";

type SidebarSearchButtonProps = {
  onToggle: () => void;
} & Omit<React.ComponentPropsWithoutRef<typeof Button>, "onClick" | "size" | "variant">;

export const SidebarSearchButton = React.forwardRef<
  HTMLButtonElement,
  SidebarSearchButtonProps
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
      <Search className="h-5 w-5" />
    </Button>
  );
});

SidebarSearchButton.displayName = "SidebarSearchButton";
