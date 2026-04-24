import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/useAuth";

function LoginPage() {
  const [email, setEmail] = useState("ops@demo.com");
  const [password, setPassword] = useState("ops123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/vendors";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#323a7a] via-[#4f46e5] to-[#9f6bff] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-white/30 bg-white/95 p-7 shadow-2xl backdrop-blur"
      >
        <p className="text-sm font-medium text-[#5b67ff]">Sign in</p>
        <h2 className="mb-2 text-2xl font-semibold">Welcome back</h2>
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
        <p className="mt-4 text-xs text-slate-600">Use seeded credentials from README to test roles.</p>
      </form>
    </div>
  );
}

export default LoginPage;
