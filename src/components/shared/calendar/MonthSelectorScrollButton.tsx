import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type MonthSelectorScrollButtonProps = {
  onToggle: () => void;
  scroll: "right" | "left";
};

export const MonthSelectorScrollButton = (
  props: MonthSelectorScrollButtonProps,
) => {
  const { onToggle, scroll } = props;

  let Icon: React.ElementType;

  switch (scroll) {
    case "right":
      Icon = ChevronRight;
      break;
    case "left":
      Icon = ChevronLeft;
      break;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="rounded-full bg-primary-foreground shadow-xs"
    >
      <Icon className="h-10 w-10" />
    </Button>
  );
};
