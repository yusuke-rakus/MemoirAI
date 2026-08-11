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
        <Icon className="mr-2 h-4 w-4 flex-shrink-0" />
        {label}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>{children}</DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};
