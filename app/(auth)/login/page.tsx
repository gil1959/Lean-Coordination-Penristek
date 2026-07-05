import LoginForm from "./LoginForm";
import Image from "next/image";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Left side - Branding/Info */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary to-orange-700 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Abstract shapes for design */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-black blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <Image src="/logo.png" alt="Himatif Logo" width={64} height={64} className="object-contain" />
            <span className="font-display font-bold text-3xl tracking-tight">HIMATIF</span>
          </div>

          <h1 className="font-display text-5xl font-bold leading-tight mb-6">
            Sistem Informasi <br/>
            Kepanitiaan Terpadu
          </h1>
          <p className="font-sans text-orange-100 text-lg max-w-md leading-relaxed">
            Platform manajemen khusus kepanitiaan HIMATIF Summer Bootcamp. Kelola tugas, pantau anggaran (RAB), dan lacak progres kepanitiaan secara real-time dan terintegrasi.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 text-sm font-sans text-orange-200">
            <span>© {new Date().getFullYear()} Departemen Penristek HIMATIF</span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-300"></span>
            <span>Versi 1.0.0</span>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative bg-canvas">
        <div className="w-full max-w-md">
          <Suspense fallback={<div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
