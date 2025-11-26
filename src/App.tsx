import { PATHS } from "@/constants/path";
import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./features/home";
import { NewDiary } from "./features/createDiary";
import { LoginPage } from "./features/login";
import { NotificationToaster } from "./components/shared/common/NotificationToaster";

export const App = () => {
  return (
    <>
      <NotificationToaster />
      <Routes>
        <Route
          path="/"
          element={<Navigate to={PATHS.calendar.path} replace />}
        />
        <Route path={PATHS.calendar.path} element={<HomePage />} />
        <Route path={PATHS.diaries.path} element={<HomePage />} />
        <Route path={PATHS.newDiary.path} element={<NewDiary />} />
        <Route path={PATHS.login.path} element={<LoginPage />} />
      </Routes>
    </>
  );
};
