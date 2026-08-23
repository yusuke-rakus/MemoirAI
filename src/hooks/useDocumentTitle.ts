import { env } from "@/lib/env";
import { useEffect } from "react";

export const useDocumentTitle = (
  title?: string | null,
  suffix: string = ` | ${env.appName}`,
) => {
  useEffect(() => {
    if (!title) return;
    const previousTitle = document.title;
    document.title = title + suffix;

    return () => {
      document.title = previousTitle;
    };
  }, [title, suffix]);
};
