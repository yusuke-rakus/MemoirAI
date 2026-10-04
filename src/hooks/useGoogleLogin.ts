import { useRef, useState } from "react";
import { toast } from "sonner";

import { auth, provider, signInWithPopup } from "@/firebase/firebase";

export const useGoogleLogin = () => {
  const pending = useRef(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const login = async (): Promise<boolean> => {
    if (pending.current) return false;
    pending.current = true;
    setIsLoggingIn(true);
    try {
      const { user } = await signInWithPopup(auth, provider);
      if (!user) throw new Error("User not found");
      if (user.displayName) {
        toast(`${user.displayName}さん、ようこそ🎉`);
      }
      return true;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error("Googleでのログインに失敗しました");
      return false;
    } finally {
      pending.current = false;
      setIsLoggingIn(false);
    }
  };

  return { login, isLoggingIn };
};
