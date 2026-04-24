import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function ProtectedLayout() {
  const { token, user, logout } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const navLinkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 font-medium transition ${
      isActive
        ? "bg-gradient-to-r from-[#5b67ff] to-[#9f6bff] text-white shadow-sm"
        : "text-[#66739a] hover:bg-[#f2f4ff] hover:text-[#1f2a44]"
    }`;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-[#1f2a44]">Payout Management</h1>
            <nav className="flex gap-2">
              <NavLink className={navLinkClass} to="/vendors">
                Vendors
              </NavLink>
              <NavLink className={navLinkClass} to="/payouts">
                Payouts
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden rounded-full border border-[#e8ecff] bg-white px-3 py-1.5 text-[#516086] shadow-sm sm:inline-flex">
              {user?.email} ({user?.role})
            </span>
            <button onClick={logout} className="ui-btn-primary px-3 py-1.5">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default ProtectedLayout;
