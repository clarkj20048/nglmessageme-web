import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import CreateProfilePage from "./pages/CreateProfilePage";
import MessagePage from "./pages/MessagePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<CreateProfilePage />} />
      <Route path="/message" element={<MessagePage />} />
      <Route path="/u/:username" element={<MessagePage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
