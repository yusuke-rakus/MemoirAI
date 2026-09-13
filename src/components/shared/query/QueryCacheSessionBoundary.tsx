import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useRef } from "react";

import { useLocalUser } from "@/contexts/LocalUserContext";

type Props = {
  children: ReactNode;
};

export const QueryCacheSessionBoundary = ({ children }: Props) => {
  const { localUser } = useLocalUser();
  const queryClient = useQueryClient();
  const previousUidRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (
      previousUidRef.current !== undefined &&
      previousUidRef.current !== localUser.uid
    ) {
      queryClient.clear();
    }
    previousUidRef.current = localUser.uid;
  }, [localUser.uid, queryClient]);

  return children;
};
