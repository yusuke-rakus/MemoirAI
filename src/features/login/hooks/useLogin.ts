import { useLocalUser } from "@/contexts/LocalUserContext";
import { auth, provider, signInWithPopup } from "@/firebase/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useLogin = () => {
  const { setLocalUser } = useLocalUser();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (!user) {
        throw new Error("User not found");
      }

      console.log(user.uid);
      setLocalUser({
        uid: user.uid,
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
      });
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
