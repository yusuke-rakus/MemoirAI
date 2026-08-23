import { auth } from "@/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

type LegalReturnDestination = {
  label: "アプリへ戻る" | "ログインへ戻る";
  to: "/" | "/login";
};

export const useLegalReturnDestination = () => {
  const [destination, setDestination] = useState<LegalReturnDestination | null>(
    null,
  );

  useEffect(
    () =>
      onAuthStateChanged(
        auth,
        (user) => {
          setDestination(
            user
              ? { label: "アプリへ戻る", to: "/" }
              : { label: "ログインへ戻る", to: "/login" },
          );
        },
        (error) => {
          console.error("Failed to determine legal page return path", error);
          setDestination({ label: "ログインへ戻る", to: "/login" });
        },
      ),
    [],
  );

  return destination;
};
