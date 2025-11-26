import { PATHS } from "@/constants/path";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useLocalUser } from "@/contexts/LocalUserContext";

const PROTECTED_PATHS = [PATHS.calendar.path, PATHS.diaries.path];

export const useAuthCheck = () => {
  const { setLocalUser } = useLocalUser();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const currentPath = window.location.pathname;
      const shouldRedirect =
        !firebaseUser &&
        PROTECTED_PATHS.some((path) => currentPath.startsWith(path));

      if (shouldRedirect) {
        navigate(PATHS.login.path, { replace: true });
      }

      if (firebaseUser) {
        setLocalUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName ?? null,
          photoURL: firebaseUser.photoURL ?? null,
        });
      }
      setUser(firebaseUser);
      // setLoading(false);

      // TODO : テスト用であるだけ
      const delayThenSetLoading = async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setLoading(false);
      };

      delayThenSetLoading();
    });

    return () => unsubscribe();
  }, [navigate]);

  return { loading, user };
};
