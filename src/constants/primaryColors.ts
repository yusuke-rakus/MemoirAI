type PrimaryColorOption = {
  key: string;
  label: string;
  previewClassName: string;
  primary: string | null;
  primaryForeground: string | null;
};

export const primaryColorOptions = [
  {
    key: "default",
    label: "デフォルト",
    previewClassName: "bg-muted-foreground",
    primary: null,
    primaryForeground: null,
  },
  {
    key: "blue",
    label: "ブルー",
    previewClassName: "bg-theme-blue",
    primary: "var(--theme-blue)",
    primaryForeground: "var(--theme-blue-foreground)",
  },
  {
    key: "green",
    label: "グリーン",
    previewClassName: "bg-theme-green",
    primary: "var(--theme-green)",
    primaryForeground: "var(--theme-green-foreground)",
  },
  {
    key: "yellow",
    label: "イエロー",
    previewClassName: "bg-theme-yellow",
    primary: "var(--theme-yellow)",
    primaryForeground: "var(--theme-yellow-foreground)",
  },
  {
    key: "red",
    label: "レッド",
    previewClassName: "bg-theme-red",
    primary: "var(--theme-red)",
    primaryForeground: "var(--theme-red-foreground)",
  },
  {
    key: "purple",
    label: "パープル",
    previewClassName: "bg-theme-purple",
    primary: "var(--theme-purple)",
    primaryForeground: "var(--theme-purple-foreground)",
  },
] as const satisfies readonly PrimaryColorOption[];

export type PrimaryColorKey = (typeof primaryColorOptions)[number]["key"];

export const DEFAULT_PRIMARY_COLOR_KEY: PrimaryColorKey = "default";

export const isPrimaryColorKey = (value: string): value is PrimaryColorKey => {
  return primaryColorOptions.some((option) => option.key === value);
};

export const normalizePrimaryColorKey = (
  value?: string | null,
): PrimaryColorKey => {
  return value && isPrimaryColorKey(value)
    ? value
    : DEFAULT_PRIMARY_COLOR_KEY;
};

export const getPrimaryColorOption = (key: PrimaryColorKey) => {
  return (
    primaryColorOptions.find((option) => option.key === key) ??
    primaryColorOptions[0]
  );
};
