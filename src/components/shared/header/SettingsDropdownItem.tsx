import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dot } from "lucide-react";
import type { ComponentProps } from "react";

type SettingsDropdownItemProps = {
  icon?: React.ElementType | null;
  label: string;
  active?: boolean;
} & ComponentProps<typeof DropdownMenuItem>;

export const SettingsDropdownItem = (props: SettingsDropdownItemProps) => {
  const { icon, label, active, ...itemProps } = props;
  const Icon = icon;

  return (
    <DropdownMenuItem {...itemProps}>
      {Icon && <Icon className="flex-shrink-0 w-4 h-4" />}
      {label}
      {active && <Dot className="text-primary" />}
    </DropdownMenuItem>
  );
};
