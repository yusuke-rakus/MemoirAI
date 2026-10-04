import { useNavigate } from "react-router-dom";

import { useGoogleLogin } from "@/hooks/useGoogleLogin";

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useGoogleLogin();

  const handleLogin = async () => {
    if (await login()) navigate("/");
  };
  return { handleLogin };
};
