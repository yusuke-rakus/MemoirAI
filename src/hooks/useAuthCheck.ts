import { normalizePrimaryColorKey } from "@/constants/primaryColors";
import { normalizeThemeKey } from "@/constants/themes";
import { defaultLocalUser, useLocalUser } from "@/contexts/LocalUserContext";
import { UserSettingsClient } from "@/lib/service/userSettingsClient";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";

export const useAuthCheck = () => {
  const { setLocalUser } = useLocalUser();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setLocalUser(defaultLocalUser);
          setUser(null);
          return;
        }

        const settings = await UserSettingsClient.getByUid<{
          theme?: string;
          primaryColor?: string;
        }>(firebaseUser.uid);
        setLocalUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName ?? null,
          photoURL: firebaseUser.photoURL ?? null,
          theme: normalizeThemeKey(settings?.theme),
          primaryColor: normalizePrimaryColorKey(settings?.primaryColor),
        });
        setUser(firebaseUser);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, setLocalUser]);

  return { loading, user };
};
