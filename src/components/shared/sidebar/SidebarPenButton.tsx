import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";

type SidebarPenButtonProps = {
  onToggle: () => void;
};

export const SidebarPenButton = (props: SidebarPenButtonProps) => {
  const { onToggle } = props;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="rounded-full"
    >
      <SquarePen className="h-5 w-5" />
    </Button>
  );
};
