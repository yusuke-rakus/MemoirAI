import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";

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
