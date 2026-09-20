import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { PATHS } from "@/constants/path";

import { LoadingScreen } from "./components/shared/common/LoadingScreen";
import { NotificationToaster } from "./components/shared/common/NotificationToaster";
import { LegacyLegalRedirect } from "./features/legal/components/LegacyLegalRedirect";
import { AuthenticatedLayout } from "./layout/AuthenticatedLayout";
import { useInitialDateStore } from "./stores/initialDateStore";

const AppShellLayout = lazy(() =>
  import("./layout/AppShellLayout").then((module) => ({
    default: module.AppShellLayout,
  })),
);
const NewDiaryPage = lazy(() =>
  import("./features/createDiary").then((module) => ({
    default: module.NewDiaryPage,
  })),
);
const DiariesPage = lazy(() =>
  import("./features/diaries").then((module) => ({
    default: module.DiariesPage,
  })),
);
const HomePage = lazy(() =>
  import("./features/home").then((module) => ({ default: module.HomePage })),
);
const LoginPage = lazy(() =>
  import("./features/login").then((module) => ({ default: module.LoginPage })),
);
const NotFoundPage = lazy(() =>
  import("./features/notFound").then((module) => ({
    default: module.NotFoundPage,
  })),
);
const SharedDiaryPage = lazy(() =>
  import("./features/sharedDiary").then((module) => ({
    default: module.SharedDiaryPage,
  })),
);
const LegalPage = lazy(() =>
  import("./features/legal/pages/LegalPage").then((module) => ({
    default: module.LegalPage,
  })),
);

export const App = () => {
  const { dateParamString, yearMonth } = useInitialDateStore();

  return (
    <>
      <NotificationToaster />
      <Suspense fallback={<LoadingScreen variant="page" />}>
        <Routes>
          <Route element={<AppShellLayout />}>
            <Route element={<AuthenticatedLayout />}>
              <Route
                path="/"
                element={
                  <Navigate
                    to={`${PATHS.calendar.path}/${yearMonth.year}/${yearMonth.month}`}
                    replace
                  />
                }
              />
              <Route
                path={`${PATHS.calendar.path}/:year/:month`}
                element={<HomePage />}
              />
              <Route
                path={PATHS.calendar.path}
                element={
                  <Navigate
                    to={`${PATHS.calendar.path}/${yearMonth.year}/${yearMonth.month}`}
                    replace
                  />
                }
              />
              <Route
                path={`${PATHS.diaries.path}/:year/:month`}
                element={<HomePage />}
              />
              <Route
                path={`${PATHS.diaries.path}/:dateParamString`}
                element={<DiariesPage />}
              />
              <Route
                path={PATHS.diaries.path}
                element={
                  <Navigate
                    to={`${PATHS.diaries.path}/${yearMonth.year}/${yearMonth.month}`}
                    replace
                  />
                }
              />
              <Route
                path={PATHS.newDiary.path}
                element={
                  <Navigate
                    to={`${PATHS.newDiary.path}/${dateParamString}`}
                    replace
                  />
                }
              />
              <Route
                path={`${PATHS.newDiary.path}/:date`}
                element={<NewDiaryPage />}
              />
            </Route>
            <Route
              path={`${PATHS.sharedDiary.path}/:diaryId`}
              element={<SharedDiaryPage />}
            />
          </Route>
          <Route path={PATHS.login.path} element={<LoginPage />} />
          <Route path={PATHS.legal.path} element={<LegalPage />} />
          <Route
            path={PATHS.terms.path}
            element={<LegacyLegalRedirect documentId="terms" />}
          />
          <Route
            path={PATHS.privacy.path}
            element={<LegacyLegalRedirect documentId="privacy" />}
          />
          <Route
            path={PATHS.aiDataUse.path}
            element={<LegacyLegalRedirect documentId="ai-data-use" />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
};
