import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

type LoginButtonProps = {
  handleLogin: () => void;
};

export const LoginButton = (props: LoginButtonProps) => {
  const { handleLogin } = props;

  return (
    <Button onClick={handleLogin}>
      <LogIn />
      ログイン
    </Button>
  );
};
