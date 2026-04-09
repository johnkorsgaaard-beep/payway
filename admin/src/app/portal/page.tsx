"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

function getRedirectParam() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("redirect");
}

export default function PortalPage() {
  const router = useRouter();
  const { state, role, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state === "authenticated" && role) {
      const redirect = getRedirectParam();
      if (redirect) {
        router.replace(redirect);
      } else if (role === "admin" || role === "account_manager") {
        router.replace("/overview");
      } else if (role === "merchant") {
        router.replace("/shop");
      }
    }
  }, [state, role, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setError("");
    setLoading(true);

    const { error: err, redirectTo } = await signIn(email.trim(), password);
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    if (redirectTo) {
      const redirect = getRedirectParam();
      router.replace(redirect ?? redirectTo);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f0faf4] via-white to-[#eef4fb] px-6">
      <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#2ec964]/[0.05] blur-[120px]" />
      <div className="absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-[#0a2f5b]/[0.03] blur-[80px]" />

      <Link
        href="/"
        className="absolute left-6 top-6 z-10 inline-flex items-center gap-2 rounded-xl border border-[#0a2f5b]/[0.08] bg-white/80 px-4 py-2.5 text-[14px] font-medium text-[#0a2f5b]/60 backdrop-blur-sm transition-all hover:border-[#0a2f5b]/20 hover:bg-white hover:text-[#0a2f5b] hover:shadow-lg"
      >
        <ArrowLeft className="h-4 w-4" />
        Til forsiden
      </Link>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src="/payway-icon.png"
            alt="PayWay"
            className="mx-auto mb-5 h-14 w-14 rounded-2xl shadow-lg shadow-[#0a2f5b]/20"
          />
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0a2f5b]">
            Log ind på PayWay
          </h1>
          <p className="mt-2 text-[14px] text-[#0a2f5b]/40">
            Admin eller butiks-dashboard
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#0a2f5b]/[0.08] bg-white p-8 shadow-xl shadow-[#0a2f5b]/[0.04]"
        >
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-[#0a2f5b]/50">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0a2f5b]/20" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="din@email.fo"
                  autoComplete="email"
                  autoFocus
                  className="w-full rounded-xl border border-[#0a2f5b]/[0.08] py-3 pl-10 pr-4 text-[14px] text-[#0a2f5b] outline-none transition-colors placeholder:text-[#0a2f5b]/20 focus:border-[#2ec964]/40 focus:shadow-sm focus:shadow-[#2ec964]/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-[#0a2f5b]/50">
                Adgangskode
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0a2f5b]/20" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#0a2f5b]/[0.08] py-3 pl-10 pr-12 text-[14px] text-[#0a2f5b] outline-none transition-colors placeholder:text-[#0a2f5b]/20 focus:border-[#2ec964]/40 focus:shadow-sm focus:shadow-[#2ec964]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#0a2f5b]/20 hover:text-[#0a2f5b]/40"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2ec964] py-3 text-[14px] font-bold text-white shadow-lg shadow-[#2ec964]/20 transition-all hover:bg-[#25a854] hover:shadow-xl hover:shadow-[#2ec964]/30 disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Logger ind...
              </>
            ) : (
              "Log ind"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-[#0a2f5b]/25">
          &copy; {new Date().getFullYear()} PayWay ApS
        </p>
      </div>
    </div>
  );
}
