import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getPrimaryColorOption,
  normalizePrimaryColorKey,
  type PrimaryColorKey,
  primaryColorOptions,
} from "@/constants/primaryColors";
import { useLocalUser } from "@/contexts/LocalUserContext";
import { UserSettingsClient } from "@/lib/service/userSettingsClient";

const PRIMARY_COLOR_VARIABLES = [
  "--primary",
  "--primary-foreground",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--ring",
] as const;

const applyPrimaryColor = (key: PrimaryColorKey) => {
  const root = document.documentElement;
  const option = getPrimaryColorOption(key);

  if (!option.primary || !option.primaryForeground) {
    PRIMARY_COLOR_VARIABLES.forEach((variableName) => {
      root.style.removeProperty(variableName);
    });
    return;
  }

  root.style.setProperty("--primary", option.primary);
  root.style.setProperty("--primary-foreground", option.primaryForeground);
  root.style.setProperty("--sidebar-primary", option.primary);
  root.style.setProperty(
    "--sidebar-primary-foreground",
    option.primaryForeground,
  );
  root.style.setProperty("--ring", option.primary);
};

export const clearPrimaryColorOverrides = () => {
  const root = document.documentElement;
  PRIMARY_COLOR_VARIABLES.forEach((variableName) => {
    root.style.removeProperty(variableName);
  });
};

export const useApplyPrimaryColor = () => {
  const { localUser } = useLocalUser();
  useEffect(() => {
    applyPrimaryColor(normalizePrimaryColorKey(localUser.primaryColor));
  }, [localUser.primaryColor]);
};

export const usePrimaryColor = (uid: string) => {
  const { localUser, setLocalUser } = useLocalUser();
  const primaryColor = normalizePrimaryColorKey(localUser.primaryColor);
  const [isSavingPrimaryColor, setIsSavingPrimaryColor] = useState(false);

  const handlePrimaryColorChange = async (nextKey: PrimaryColorKey) => {
    if (
      !uid ||
      uid !== localUser.uid ||
      isSavingPrimaryColor ||
      nextKey === primaryColor
    )
      return;
    const previousColor = primaryColor;
    setLocalUser((current) => ({ ...current, primaryColor: nextKey }));
    setIsSavingPrimaryColor(true);
    try {
      await UserSettingsClient.update(uid, {
        primaryColor: nextKey,
        updatedAt: new Date(),
      });
      toast(
        `プライマリカラーを ${getPrimaryColorOption(nextKey).label} に変更しました`,
      );
    } catch (error) {
      console.error("Failed to save primary color settings:", error);
      setLocalUser((current) =>
        current.uid === uid && current.primaryColor === nextKey
          ? { ...current, primaryColor: previousColor }
          : current,
      );
      toast.error("カラー設定の保存に失敗しました");
    } finally {
      setIsSavingPrimaryColor(false);
    }
  };
  return {
    primaryColor,
    primaryColorOptions,
    handlePrimaryColorChange,
    isSavingPrimaryColor,
  };
};
