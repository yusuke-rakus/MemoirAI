import { env } from "@/lib/env";
import { useEffect } from "react";

export const useDocumentTitle = (
  title: string,
  prefix: string = `${env.appName} | `,
) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = prefix + title;

    return () => {
      document.title = prefix + previousTitle;
    };
  }, [title]);
};
