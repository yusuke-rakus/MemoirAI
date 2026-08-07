import { SidebarPenButton } from "@/components/shared/sidebar/SidebarPenButton";
import { useSidebar } from "@/components/ui/sidebar";
import { PATHS } from "@/constants/path";
import { useNavigate } from "react-router-dom";

export const SidebarCreateDiaryButton = () => {
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleCreateDiary = () => {
    navigate(PATHS.newDiary.path);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return <SidebarPenButton onToggle={handleCreateDiary} />;
};
