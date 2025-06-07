import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

type SidebarSearchButtonProps = {
  onToggle: () => void;
};

export const SidebarSearchButton = (props: SidebarSearchButtonProps) => {
  const { onToggle } = props;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="rounded-full"
    >
      <Search className="h-5 w-5" />
    </Button>
  );
};
