import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReactNode } from "react";

type AppTooltipProps = {
  discription: string;
  children: ReactNode;
};

export const AppTooltip = (props: AppTooltipProps) => {
  const { discription, children } = props;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{discription}</TooltipContent>
    </Tooltip>
  );
};
