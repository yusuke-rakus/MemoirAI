import {
  DEFAULT_PRIMARY_COLOR_KEY,
  getPrimaryColorOption,
  normalizePrimaryColorKey,
  primaryColorOptions,
  type PrimaryColorKey,
} from "@/constants/primaryColors";
import { useLocalUser } from "@/contexts/LocalUserContext";
import { UserSettingsClient } from "@/lib/service/userSettingsClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

export const usePrimaryColor = (uid: string) => {
  const [primaryColor, setPrimaryColor] = useState<PrimaryColorKey>(
    DEFAULT_PRIMARY_COLOR_KEY,
  );
  const [isSavingPrimaryColor, setIsSavingPrimaryColor] = useState(false);
  const { localUser } = useLocalUser();

  useEffect(() => {
    const colorKey = normalizePrimaryColorKey(localUser.primaryColor);

    setPrimaryColor(colorKey);
    applyPrimaryColor(colorKey);
  }, [localUser.primaryColor]);

  const handlePrimaryColorChange = async (nextKey: PrimaryColorKey) => {
    if (!uid || isSavingPrimaryColor || nextKey === primaryColor) {
      return;
    }

    const previousColor = primaryColor;
    setPrimaryColor(nextKey);
    applyPrimaryColor(nextKey);
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
      setPrimaryColor(previousColor);
      applyPrimaryColor(previousColor);
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
