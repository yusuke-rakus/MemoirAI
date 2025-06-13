import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./features/home";
import { AboutPage } from "./features/createDiary";
import { LoginPage } from "./features/login";
import { NotificationToaster } from "./components/shared/common/NotificationToaster";

export const App = () => {
  return (
    <>
      <NotificationToaster />
      <Routes>
        <Route path="/" element={<Navigate to="/calendar" replace />} />
        <Route path="/calendar" element={<HomePage />} />
        <Route path="/diaries" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
};
