type ThemeOption = {
  key: string;
  label: string;
  value: string;
};

export const themeOptions = [
  {
    key: "light",
    label: "ライト",
    value: "light",
  },
  {
    key: "dark",
    label: "ダーク",
    value: "dark",
  },
  {
    key: "system",
    label: "システム",
    value: "system",
  },
] as const satisfies readonly ThemeOption[];

export type THemeKey = (typeof themeOptions)[number]["key"];

export const DEFAULT_THEME_KEY: THemeKey = "system";

export const isThemeKey = (value: string): value is THemeKey => {
  return themeOptions.some((option) => option.key === value);
};

export const normalizeThemeKey = (value?: string): THemeKey => {
  return value && isThemeKey(value) ? value : DEFAULT_THEME_KEY;
};

export const getThemeOption = (key: THemeKey) => {
  return themeOptions.find((option) => option.key === key) ?? themeOptions[0];
};
