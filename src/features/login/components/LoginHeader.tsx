import { LoginButton } from "@/components/shared/login/LoginButton";
import { useLogin } from "../hooks/useLogin";

export const LoginHeader = () => {
  const { handleLogin } = useLogin();

  return (
    <header
      className="fixed
        top-0
        right-0
        left-0
        h-14
        border-b
        bg-background
        shadow-sm
        z-40
        px-4
        transition-all
        duration-250
        flex
        items-center"
    >
      <div className="text-2xl font-bold">MemoirAI</div>
      <div className="ml-auto">
        <LoginButton handleLogin={handleLogin} />
      </div>
    </header>
  );
};
