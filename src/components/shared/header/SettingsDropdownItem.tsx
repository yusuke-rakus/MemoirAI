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
      {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
      {label}
      {active && <Dot className="text-primary" />}
    </DropdownMenuItem>
  );
};
