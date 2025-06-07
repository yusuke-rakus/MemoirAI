import { Button } from "@/components/ui/button";
import { PanelLeft, PanelLeftOpen } from "lucide-react";

type SidebarToggleButtonProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export const SidebarToggleButton = (props: SidebarToggleButtonProps) => {
  const { isOpen, onToggle } = props;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="rounded-full"
    >
      {isOpen ? (
        <PanelLeft className="h-5 w-5" />
      ) : (
        <PanelLeftOpen className="h-5 w-5" />
      )}
    </Button>
  );
};
