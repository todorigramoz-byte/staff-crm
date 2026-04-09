import React, { useState } from "react";
import { useAuth } from "@animaapp/playground-react-sdk";
import { Users, ArrowRight, Eye, EyeSlash } from "@phosphor-icons/react";

export default function Login() {
  const { login } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsPending(true);
    try {
      await login();
    } catch (err: any) {
      setError(err?.message || "Kyçja dështoi. Provo përsëri.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
          <div className="h-2 bg-gradient-primary" />

          <div className="px-8 py-10">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-md mb-4">
                <Users size={28} weight="fill" className="text-white" />
              </div>
              <h1 className="text-h3 font-sans font-semibold text-foreground tracking-tight">
                My CRM
              </h1>
              <p className="text-body-sm text-neutral-500 mt-1 font-body">
                Sistemi i menaxhimit të klientëve
              </p>
            </div>

            {/* Description */}
            <div className="text-center mb-6">
              <p className="text-body-sm text-neutral-600 font-body leading-relaxed">
                Kyçuni me emailin tuaj ose krijoni llogari të re falas.
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-body-sm text-red-600">
                {error}
              </div>
            )}

            {/* Single login button — opens Anima modal (login + signup) */}
            <form onSubmit={handleLogin}>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-primary text-white font-medium text-body-sm font-body shadow-sm hover:opacity-90 active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Duke hapur...
                  </span>
                ) : (
                  <>
                    Kyçu / Regjistrohu
                    <ArrowRight size={16} weight="bold" className="ml-auto" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-caption text-neutral-400 font-body mt-4">
              Klikoni butonin për t&#39;u kyçur ose për të krijuar llogari të re me email.
            </p>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-neutral-50 border-t border-border flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-caption text-neutral-500 font-body">
              Platform i sigurt · Të dhënat tuaja janë të mbrojtura
            </span>
          </div>
        </div>

        <p className="text-center text-caption text-neutral-400 font-body mt-6">
          © {new Date().getFullYear()} My CRM · Për bizneset tuaja
        </p>
      </div>
    </div>
  );
}
