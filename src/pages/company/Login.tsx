import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Spinner } from "@/components/ui/Spinner";

export function CompanyLogin() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("Welcome back!", "success");
      navigate("/company/dashboard");
    }, 1200);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="flex w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800 lg:max-w-4xl">
        {/* Left image column — hidden below lg */}
        <div
          className="hidden lg:block lg:w-1/2 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/download_(1).jpg')",
            backgroundPosition: "80% center",
          }}
        />

        {/* Right form column */}
        <div className="w-full px-6 py-8 md:px-8 lg:w-1/2">
          {/* Wordmark */}
          <div className="flex justify-center mx-auto mb-1">
            <span className="text-2xl font-bold tracking-wide text-teal-600">
              the platform
            </span>
          </div>

          <p className="mt-2 text-xl text-center text-gray-600 dark:text-gray-200">
            Welcome back, Company
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="company-email"
                className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
              >
                Email Address
              </label>
              <input
                id="company-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={loading}
                className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-teal-500 focus:ring-opacity-40 dark:focus:border-teal-400 focus:outline-none focus:ring focus:ring-teal-300 transition-colors duration-200 disabled:opacity-60"
                placeholder="info@yourcompany.co.tz"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label
                  htmlFor="company-password"
                  className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                >
                  Password
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-300 mb-2 cursor-default select-none">
                  Forgot Password?
                </span>
              </div>
              <input
                id="company-password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={loading}
                className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-teal-500 focus:ring-opacity-40 dark:focus:border-teal-400 focus:outline-none focus:ring focus:ring-teal-300 transition-colors duration-200 disabled:opacity-60"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring focus:ring-teal-300 focus:ring-opacity-50 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Spinner className="w-4 h-4" /> Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <div className="flex items-center justify-between mt-4">
            <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4" />
            <Link
              to="/institution/register"
              className="text-xs text-gray-500 uppercase dark:text-gray-400 hover:underline"
            >
              or sign up
            </Link>
            <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
