import { auth, provider, signInWithPopup } from "@/firebase/firebase";
import { runNewUserSettingsMigrations } from "@/lib/service/userSettingsMigration";
import { getAdditionalUserInfo } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useLogin = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (!user) {
        throw new Error("User not found");
      }

      const isNewUser = getAdditionalUserInfo(result)?.isNewUser ?? false;
      if (isNewUser) {
        await runNewUserSettingsMigrations(user.uid, user.displayName);
      }

      navigate("/");
      if (user.displayName) {
        toast(`${user.displayName}さん、ようこそ🎉`);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error("Googleでのログインに失敗しました");
    }
  };
  return { handleLogin };
};
