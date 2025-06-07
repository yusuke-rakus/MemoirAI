import { useLocalUser } from "@/contexts/LocalUserContext";

export const LoginView = () => {
  const { localUser } = useLocalUser();

  return <h1>LoginView Page: {localUser?.displayName}</h1>;
};
