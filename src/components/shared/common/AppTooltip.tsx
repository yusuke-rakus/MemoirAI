import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReactNode } from "react";

type AppTooltipProps = {
  description: string;
  children: ReactNode;
  openOnFocus?: boolean;
};

export const AppTooltip = (props: AppTooltipProps) => {
  const { description, children, openOnFocus = true } = props;
  return (
    <Tooltip>
      <TooltipTrigger
        asChild
        onFocus={openOnFocus ? undefined : (event) => event.preventDefault()}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{description}</TooltipContent>
    </Tooltip>
  );
};
