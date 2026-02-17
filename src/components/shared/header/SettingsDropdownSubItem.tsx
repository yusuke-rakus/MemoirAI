import {
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReactNode } from "react";

type SettingsDropdownSubItemProps = {
  icon: React.ElementType;
  label: string;
  children: ReactNode;
};

export const SettingsDropdownSubItem = (
  props: SettingsDropdownSubItemProps,
) => {
  const { icon, label, children } = props;
  const Icon = icon;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Icon className="flex-shrink-0 w-4 h-4 mr-2" />
        {label}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>{children}</DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};
