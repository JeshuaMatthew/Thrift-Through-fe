import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../Utils/Hooks/AuthProvider";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login({ Email: email, Password: password });

      if (result.success) {
        // Successfully logged in, navigate to a protected route (e.g., /thrifts)
        navigate("/thrifts");
      } else {
        // Login failed
        setError(result.message);
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 relative mt-16 md:mt-0">
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-gasoek text-tx-primary mb-2">
          Selamat datang !
        </h2>
        <p className="text-tx-secondary font-questrial">
          Silahkan masukan email dan password anda.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5 relative z-10">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400 text-sm animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        <div className="space-y-1 font-questrial">
          <label className="text-sm font-bold text-tx-primary block">
            Alamat Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-tx-muted"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl bg-slate-50 text-tx-primary placeholder-tx-muted focus:outline-none focus:ring-2 focus:ring-bg-vermillion focus:border-transparent transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1 font-questrial">
          <label className="text-sm font-bold text-tx-primary block">
            Kata Sandi
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-tx-muted"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl bg-slate-50 text-tx-primary placeholder-tx-muted focus:outline-none focus:ring-2 focus:ring-bg-vermillion focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-gray-900 bg-bg-fresh cursor-pointer font-questrial ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg"
          }`}
        >
          {loading ? (
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Masuk"
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-tx-secondary font-questrial">
        Tidak punya akun?{" "}
        <Link
          to="/register"
          className="font-bold text-tx-secondary hover:text-bg-fresh transition-colors"
        >
          Daftar disini
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
