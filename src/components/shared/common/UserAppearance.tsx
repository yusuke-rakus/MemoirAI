import { useApplyPrimaryColor } from "@/hooks/usePrimaryColor";
import { useApplyTheme } from "@/hooks/useTheme";

export const UserAppearance = () => {
  useApplyTheme();
  useApplyPrimaryColor();
  return null;
};
