import { SidebarPenButton } from "@/components/shared/sidebar/SidebarPenButton";
import { useSidebar } from "@/components/ui/sidebar";
import { PATHS } from "@/constants/path";
import * as React from "react";
import { useNavigate } from "react-router-dom";

type SidebarCreateDiaryButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof SidebarPenButton>,
  "onToggle"
>;

export const SidebarCreateDiaryButton = React.forwardRef<
  HTMLButtonElement,
  SidebarCreateDiaryButtonProps
>((props, ref) => {
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleCreateDiary = () => {
    navigate(PATHS.newDiary.path);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return <SidebarPenButton ref={ref} {...props} onToggle={handleCreateDiary} />;
});

SidebarCreateDiaryButton.displayName = "SidebarCreateDiaryButton";
