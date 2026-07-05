"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const callbackUrl = searchParams.get("from") || "/dashboard";

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="w-full">
      {/* Mobile Logo Header */}
      <div className="flex lg:hidden items-center gap-3 mb-10">
        <Image src="/logo.png" alt="Himatif Logo" width={40} height={40} className="object-contain" />
        <span className="font-display font-bold text-2xl text-primary tracking-tight">HIMATIF</span>
      </div>

      <div className="mb-10">
        <h2 className="display-md mb-2 text-ink">Selamat Datang Kembali</h2>
        <p className="text-body-mid font-sans text-sm">Masuk untuk mengelola kepanitiaan Anda.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-sans flex items-start gap-2">
            <div className="mt-0.5">⚠️</div>
            <span>{error}</span>
          </div>
        )}
        
        <div className="flex flex-col gap-1.5 group">
          <label className="font-sans font-semibold text-sm text-ink-soft group-focus-within:text-primary transition-colors">Alamat Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-body-mid group-focus-within:text-primary transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-input py-3 w-full rounded-xl border-mute focus:ring-primary focus:border-primary transition-all bg-white"
              style={{ paddingLeft: '2.75rem' }}
              placeholder="nama@bootcamp.com"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 group">
          <div className="flex justify-between items-center">
             <label className="font-sans font-semibold text-sm text-ink-soft group-focus-within:text-primary transition-colors">Kata Sandi</label>
             <span className="text-xs text-primary hover:underline font-semibold cursor-pointer">Lupa sandi?</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-body-mid group-focus-within:text-primary transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-input py-3 w-full rounded-xl border-mute focus:ring-primary focus:border-primary transition-all bg-white"
              style={{ paddingLeft: '2.75rem' }}
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary py-3.5 mt-4 rounded-xl flex items-center justify-center gap-2 group relative overflow-hidden"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span className="font-semibold text-base relative z-10">Masuk ke Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
