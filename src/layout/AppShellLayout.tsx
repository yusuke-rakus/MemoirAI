import { LoadingScreen } from "@/components/shared/common/LoadingScreen";
import { PATHS } from "@/constants/path";
import { LegalConsentError } from "@/features/legal/components/LegalConsentError";
import { LegalConsentGate } from "@/features/legal/components/LegalConsentGate";
import { useLegalAcceptance } from "@/features/legal/hooks/useLegalAcceptance";
import { auth } from "@/firebase/firebase";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useUserInitialization } from "@/hooks/useUserInitialization";
import { signOut, type User } from "firebase/auth";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MainLayout } from "./MainLayout";

export type AppShellOutletContext = {
  user: User | null;
};

export const AppShellLayout = () => {
  const { loading, user } = useAuthCheck();
  const legalAcceptance = useLegalAcceptance(user?.uid);
  const userInitialization = useUserInitialization(
    user?.uid,
    user?.displayName,
    legalAcceptance.status === "accepted",
  );
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate(PATHS.login.path, { replace: true });
    } catch (error) {
      console.error("Failed to sign out from legal consent gate", error);
      toast.error("ログアウトに失敗しました");
    }
  };

  if (
    loading ||
    (user &&
      (legalAcceptance.status === "idle" ||
        legalAcceptance.status === "loading" ||
        (legalAcceptance.status === "accepted" &&
          (userInitialization.status === "idle" ||
            userInitialization.status === "loading"))))
  ) {
    return <LoadingScreen variant="page" />;
  }

  if (user && legalAcceptance.status === "error") {
    return (
      <LegalConsentError
        onRetry={legalAcceptance.retry}
        onLogout={handleLogout}
      />
    );
  }

  if (user && legalAcceptance.status === "required") {
    return (
      <LegalConsentGate
        isSubmitting={legalAcceptance.isSubmitting}
        submitError={legalAcceptance.submitError}
        onAccept={legalAcceptance.accept}
        onLogout={handleLogout}
      />
    );
  }

  if (user && userInitialization.status === "error") {
    return (
      <LegalConsentError
        title="利用準備を完了できませんでした"
        description="通信状態を確認して再試行してください。準備が完了するまで、日記の内容は表示されません。"
        onRetry={userInitialization.retry}
        onLogout={handleLogout}
      />
    );
  }

  const outlet = <Outlet context={{ user } satisfies AppShellOutletContext} />;

  if (!user) {
    return outlet;
  }

  return <MainLayout>{outlet}</MainLayout>;
};
