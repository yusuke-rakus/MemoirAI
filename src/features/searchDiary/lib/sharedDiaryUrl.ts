import { PATHS } from "@/constants/path";

export type SharedDiaryUrlResult =
  { kind: "keyword" } | { kind: "invalid" } | { kind: "shared"; path: string };

/** Classify search input without fetching the diary or navigating externally. */
export function parseSharedDiaryUrl(
  input: string,
  origin: string,
): SharedDiaryUrlResult {
  const value = input.trim();
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
      path: `${PATHS.sharedDiary.path}/${encodeURIComponent(id)}`,
    };
  } catch {
    return { kind: "invalid" };
  }
}
