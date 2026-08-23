import { PATHS } from "@/constants/path";
import { Navigate, Route, Routes } from "react-router-dom";
import { NotificationToaster } from "./components/shared/common/NotificationToaster";
import { NewDiaryPage } from "./features/createDiary";
import { DiariesPage } from "./features/diaries";
import { HomePage } from "./features/home";
import { LoginPage } from "./features/login";
import { LegacyLegalRedirect, LegalPage } from "./features/legal";
import { SharedDiaryPage } from "./features/sharedDiary";
import { AppShellLayout } from "./layout/AppShellLayout";
import { AuthenticatedLayout } from "./layout/AuthenticatedLayout";
import { useInitialDateStore } from "./stores/initialDateStore";

export const App = () => {
  const { dateParamString, yearMonth } = useInitialDateStore();

  return (
    <>
      <NotificationToaster />
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
      </Routes>
    </>
  );
};
