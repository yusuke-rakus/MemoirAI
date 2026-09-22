import { PATHS } from "@/constants/path";

export type SharedDiaryUrlResult =
  | { kind: "keyword" }
  | { kind: "invalid" }
  | { kind: "shared"; path: string; shareId: string };

/** Classify search input without fetching the diary or navigating externally. */
export function parseSharedDiaryUrl(
  input: string,
  origin: string,
): SharedDiaryUrlResult {
  const value = input.trim();
  if (
    /^share-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
      value,
    )
  ) {
    return {
      kind: "shared",
      shareId: value,
      path: `${PATHS.sharedDiary.path}/${value}`,
    };
  }
  if (/^share-/i.test(value)) return { kind: "invalid" };
  if (!/^(?:[a-z][a-z\d+.-]*:|\/\/|\/shared(?:\/|$)|www\.)/i.test(value)) {
    return { kind: "keyword" };
  }

  try {
    // Reject characters URL() would silently remove or normalize.
    if (/[\s\\]/u.test(value)) return { kind: "invalid" };
    const url = new URL(value);
    if (
      !/^https?:$/.test(url.protocol) ||
      url.origin !== new URL(origin).origin ||
      url.username ||
      url.password
    ) {
      return { kind: "invalid" };
    }
    const match = /^\/shared\/([^/]+)\/?$/.exec(url.pathname);
    if (!match) return { kind: "invalid" };
    const id = decodeURIComponent(match[1]);
    if (
      /[/\\\s]/u.test(id) ||
      Array.from(id).some(
        (character) =>
          character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
      ) ||
      id === "." ||
      id === ".."
    ) {
      return { kind: "invalid" };
    }
    // Dot segments must not turn an unrelated input path into a shared URL.
    const rawPath = value.replace(/^https?:\/\/[^/]+/i, "").split(/[?#]/)[0];
    if (!/^\/shared\/[^/]+\/?$/.test(rawPath)) return { kind: "invalid" };
    return {
      kind: "shared",
      shareId: id,
      path: `${PATHS.sharedDiary.path}/${encodeURIComponent(id)}`,
    };
  } catch {
    return { kind: "invalid" };
  }
}
