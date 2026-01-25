import { PATHS } from "@/constants/path";
import { Navigate, Route, Routes } from "react-router-dom";
import { NotificationToaster } from "./components/shared/common/NotificationToaster";
import { NewDiaryPage } from "./features/createDiary";
import { HomePage } from "./features/home";
import { LoginPage } from "./features/login";
import { useInitialDateStore } from "./stores/initialDateStore";

export const App = () => {
  const { dateParamString, yearMonth } = useInitialDateStore();

  return (
    <>
      <NotificationToaster />
      <Routes>
        <Route
          path="/"
          element={
            <Navigate to={`${PATHS.calendar.path}/:year/:month`} replace />
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
        <Route path={PATHS.login.path} element={<LoginPage />} />
      </Routes>
    </>
  );
};
