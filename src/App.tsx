import { Routes, Route } from "react-router-dom";
import { HomePage } from "./features/home";
import { AboutPage } from "./features/about";
import { LoginPage } from "./features/login";
import { NotificationToaster } from "./components/shared/common/NotificationToaster";

export const App = () => {
  return (
    <>
      <NotificationToaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
};
