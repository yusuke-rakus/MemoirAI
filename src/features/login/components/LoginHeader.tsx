import { LoginButton } from "@/components/shared/login/LoginButton";
import { useLogin } from "../hooks/useLogin";

export const LoginHeader = () => {
  const { handleLogin } = useLogin();

  return (
    <header className="fixed top-0 right-0 left-0 z-40 flex h-14 items-center border-b bg-background px-4 shadow-sm transition-all duration-250">
      <div className="text-2xl font-bold">MemoirAI</div>
      <div className="ml-auto">
        <LoginButton handleLogin={handleLogin} />
      </div>
    </header>
  );
};
