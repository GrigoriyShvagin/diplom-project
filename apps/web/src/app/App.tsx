import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/shared/lib/i18n";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { TripDetailPage } from "@/pages/TripDetailPage";

export function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/trips" element={<DashboardPage />} />
          <Route path="/trips/:id" element={<TripDetailPage />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}
