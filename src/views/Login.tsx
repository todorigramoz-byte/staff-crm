import React, { useState } from "react";
import { useLang } from "../context/LangContext";
import { Users, Lock, ArrowRight, Eye, EyeSlash, Warning, Question, X, Info, Globe } from "@phosphor-icons/react";

const ADMIN_USERNAME = "admin";
const STORED_PASSWORD_KEY = "crmAdminPassword";

function getAdminPassword() {
  return localStorage.getItem(STORED_PASSWORD_KEY) || "admin123";
}

export default function Login() {
  const { lang, setLang, t } = useLang();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === getAdminPassword()) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userName", "Admin");
        localStorage.setItem("userEmail", "admin@mycrm.al");
        window.dispatchEvent(new Event("authChange"));
      } else {
        setError(t("login_error"));
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
          {/* Header band */}
          <div className="h-2 bg-gradient-primary" />

          <div className="px-8 py-10">
            {/* Logo + lang toggle */}
            <div className="flex flex-col items-center mb-8 relative">
              <button
                onClick={() => setLang(lang === "sq" ? "en" : "sq")}
                className="absolute top-0 right-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-neutral-50 text-neutral-600 hover:border-primary hover:text-primary transition-all text-caption font-body cursor-pointer"
                title={lang === "sq" ? "Switch to English" : "Kalo në Shqip"}
              >
                <Globe size={14} />
                {lang === "sq" ? "EN" : "SQ"}
              </button>
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-md mb-4">
                <Users size={28} weight="fill" className="text-white" />
              </div>
              <h1 className="text-h3 font-sans font-semibold text-foreground tracking-tight">
                My CRM
              </h1>
              <p className="text-body-sm text-neutral-500 mt-1 font-body">
                {t("login_title")}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-body-sm font-medium text-foreground font-body mb-1.5">
                  {t("login_username")}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Users size={17} weight="regular" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-neutral-50 text-body-sm font-body text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-body-sm font-medium text-foreground font-body mb-1.5">
                  {t("login_password")}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Lock size={17} weight="regular" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-neutral-50 text-body-sm font-body text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
                  >
                    {showPassword ? <EyeSlash size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-caption text-primary hover:underline font-body transition-colors"
                >
                  {t("login_forgot")}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-error text-body-sm font-body">
                  <Warning size={16} weight="fill" className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-primary text-white font-medium text-body-sm font-body shadow-sm hover:opacity-90 active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {t("login_loading")}
                  </span>
                ) : (
                  <>
                    {t("login_submit")}
                    <ArrowRight size={16} weight="bold" className="ml-auto" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-neutral-50 border-t border-border flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-caption text-neutral-500 font-body">
              {t("login_secure")}
            </span>
          </div>
        </div>

        {/* Sub note */}
        <p className="text-center text-caption text-neutral-400 font-body mt-6">
          &copy; {new Date().getFullYear()} My CRM · {t("login_footer")}
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-border w-full max-w-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-primary" />
            <div className="px-6 py-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Question size={18} weight="fill" className="text-primary" />
                  </div>
                  <h2 className="text-h4 font-sans font-semibold text-foreground">
                    {t("login_creds_title")}
                  </h2>
                </div>
                <button
                  onClick={() => setShowForgot(false)}
                  className="p-1 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X size={18} weight="regular" />
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2 mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <Info size={15} weight="fill" className="text-primary shrink-0" />
                  <span className="text-body-sm font-medium text-primary font-body">{t("login_creds_current")}</span>
                </div>
                <div className="space-y-1.5 text-body-sm font-body">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">{t("login_creds_user")}</span>
                    <code className="bg-white px-2 py-0.5 rounded border border-blue-200 text-foreground font-mono text-caption">admin</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">{t("login_creds_pw")}</span>
                    <code className="bg-white px-2 py-0.5 rounded border border-blue-200 text-foreground font-mono text-caption">{getAdminPassword()}</code>
                  </div>
                </div>
              </div>

              <p className="text-caption text-neutral-500 font-body mb-4">
                {t("login_creds_change")} <strong>{t("login_creds_settings")}</strong>.
              </p>

              <button
                onClick={() => setShowForgot(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-primary text-white text-body-sm font-medium font-body hover:opacity-90 transition"
              >
                {t("login_ok")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
