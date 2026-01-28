import { env } from "@/lib/env";
import { useEffect } from "react";

export const useDocumentTitle = (
  title: string,
  suffix: string = ` | ${env.appName}`,
) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title + suffix;

    return () => {
      document.title = previousTitle + suffix;
    };
  }, [title, suffix]);
};
