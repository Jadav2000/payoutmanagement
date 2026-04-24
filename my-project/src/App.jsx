

import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import VendorsPage from "./pages/VendorsPage";
import PayoutListPage from "./pages/PayoutListPage";
import PayoutDetailPage from "./pages/PayoutDetailPage";
import ProtectedLayout from "./components/ProtectedLayout";
import { useAuth } from "./context/useAuth";

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/vendors" replace /> : <LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/payouts" element={<PayoutListPage />} />
        <Route path="/payouts/:id" element={<PayoutDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to={token ? "/vendors" : "/login"} replace />} />
    </Routes>
  );
}

export default App;