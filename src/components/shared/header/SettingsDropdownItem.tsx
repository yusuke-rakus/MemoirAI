import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { ComponentProps } from "react";

type SettingsDropdownItemProps = {
  icon?: React.ElementType | null;
  label: string;
} & ComponentProps<typeof DropdownMenuItem>;

export const SettingsDropdownItem = (props: SettingsDropdownItemProps) => {
  const { icon, label, ...itemProps } = props;
  const Icon = icon;

  return (
    <DropdownMenuItem {...itemProps}>
      {Icon && <Icon className="text-primary flex-shrink-0 w-4 h-4" />}
      {label}
    </DropdownMenuItem>
  );
};
