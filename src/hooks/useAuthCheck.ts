import { PATHS } from "@/constants/path";
import { normalizePrimaryColorKey } from "@/constants/primaryColors";
import { normalizeThemeKey } from "@/constants/themes";
import { defaultLocalUser, useLocalUser } from "@/contexts/LocalUserContext";
import { UserSettingsClient } from "@/lib/service/userSettingsClient";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PROTECTED_PATHS = [
  PATHS.calendar.path,
  PATHS.diaries.path,
  PATHS.newDiary.path,
];

export const useAuthCheck = () => {
  const { setLocalUser } = useLocalUser();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        const currentPath = window.location.pathname;
        const shouldRedirect =
          !firebaseUser &&
          PROTECTED_PATHS.some((path) => currentPath.startsWith(path));

        if (shouldRedirect) {
          navigate(PATHS.login.path, { replace: true });
        }

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
  }, [auth, navigate, setLocalUser]);

  return { loading, user };
};
