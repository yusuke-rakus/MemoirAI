export const DEFAULT_DISPLAY_NAME = "ユーザー";
export const DISPLAY_NAME_MAX_LENGTH = 50;

export const normalizeDisplayName = (displayName?: string | null) => {
  const normalizedDisplayName = displayName?.trim() || DEFAULT_DISPLAY_NAME;
  return normalizedDisplayName.slice(0, DISPLAY_NAME_MAX_LENGTH);
};
