import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage isLogin={true} />} />
        <Route path="/register" element={<AuthPage isLogin={false} />} />
        <Route path="/dashboard" element={<div className="text-white p-8">Mock Dashboard - Phase 2 Pending</div>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
