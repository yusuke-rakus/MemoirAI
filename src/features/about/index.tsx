import { MainLayout } from "@/layout/MainLayout";
import { AboutView } from "./components/AboutView";
import { useAuthCheck } from "@/hooks/useAuthCheck";

export const AboutPage = () => {
  const { loading } = useAuthCheck();

  return loading ? (
    <h1>Loading...</h1>
  ) : (
    <MainLayout title="About">
      <AboutView />
    </MainLayout>
  );
};
