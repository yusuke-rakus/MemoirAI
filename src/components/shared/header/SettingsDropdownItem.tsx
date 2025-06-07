import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type SettingsDropdownItemProps = {
  icon: React.ElementType;
  label: string;
};

export const SettingsDropdownItem = (props: SettingsDropdownItemProps) => {
  const { icon, label } = props;
  const Icon = icon;

  return (
    <DropdownMenuItem>
      <Icon className="text-primary" />
      {label}
    </DropdownMenuItem>
  );
};
