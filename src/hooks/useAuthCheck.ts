import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";

import { normalizePrimaryColorKey } from "@/constants/primaryColors";
import { normalizeThemeKey } from "@/constants/themes";
import { defaultLocalUser, useLocalUser } from "@/contexts/LocalUserContext";
import { UserProfileClient } from "@/lib/service/userProfileClient";
import { UserSettingsClient } from "@/lib/service/userSettingsClient";

export const useAuthCheck = () => {
  const { setLocalUser } = useLocalUser();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    let revision = 0;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const requestRevision = ++revision;
      setLoading(true);
      try {
        if (!firebaseUser) {
          setLocalUser(defaultLocalUser);
          setUser(null);
          return;
        }

        const [settings, profile] = await Promise.all([
          UserSettingsClient.getByUid<{
            theme?: string;
            primaryColor?: string;
            markdownEditorEnabled?: unknown;
          }>(firebaseUser.uid),
          UserProfileClient.getByUid(firebaseUser.uid),
        ]);
        if (requestRevision !== revision) return;
        setLocalUser({
          uid: firebaseUser.uid,
          displayName: profile?.displayName ?? firebaseUser.displayName ?? null,
          photoURL: firebaseUser.photoURL ?? null,
          theme: normalizeThemeKey(settings?.theme),
          primaryColor: normalizePrimaryColorKey(settings?.primaryColor),
          markdownEditorEnabled: settings?.markdownEditorEnabled === true,
        });
        setUser(firebaseUser);
      } finally {
        if (requestRevision === revision) setLoading(false);
      }
    });

    return () => {
      revision++;
      unsubscribe();
    };
  }, [auth, setLocalUser]);

  return { loading, user };
};
