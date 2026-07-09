"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { customSignOut } from "@/app/actions";
import { LayoutDashboard, Users, CheckSquare, FileSpreadsheet, LogOut, Settings, UserCircle, UserPlus, ClipboardList } from "lucide-react";

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "RACI Matrix", href: "/dashboard/raci", icon: Users },
    { name: "Tracking", href: "/dashboard/tracking", icon: CheckSquare },
    { name: "Tugas Saya", href: "/dashboard/tasks", icon: ClipboardList },
    { name: "Profil Saya", href: "/dashboard/profile", icon: UserCircle },
  ];

  if (user?.role === "SUPER_ADMIN" || user?.role === "BENDAHARA" || user?.role === "PENASIHAT") {
    navItems.push({ name: "RAB Module", href: "/dashboard/rab", icon: FileSpreadsheet });
  }

  if (user?.role === "SUPER_ADMIN" || user?.role === "KOORDINATOR_DIVISI") {
    navItems.push({ name: "User & Divisi", href: "/dashboard/admin", icon: Settings });
  }

  if (user?.role === "SUPER_ADMIN" || user?.role === "SEKRETARIS" || user?.role === "KOORDINATOR_DIVISI") {
    navItems.push({ name: "Pendaftaran Panitia", href: "/dashboard/registrasi", icon: UserPlus });
    navItems.push({ name: "Pendaftaran Peserta", href: "/dashboard/peserta", icon: Users });
  }

  return (
    <div className="w-64 bg-canvas border-r border-ink min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-40">
      <div className="p-6 border-b border-ink flex justify-center">
        <Link href="/dashboard" className="block">
          <Image src="/logo.png" alt="Himatif Logo" width={64} height={64} className="object-contain" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        <div className="text-xs uppercase font-sans font-semibold text-body-mid mb-2 tracking-wider px-2">Menu</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md font-sans text-[16px] leading-[24px] transition-colors ${
                isActive 
                  ? "bg-primary text-on-primary font-semibold" 
                  : "text-ink hover:bg-canvas-soft"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-ink bg-canvas-soft flex items-center justify-between">
        <div className="flex flex-col overflow-hidden">
          <span className="font-sans font-semibold text-sm text-ink truncate">{user.name}</span>
          <span className="font-sans text-xs text-body-mid truncate">
            {user.role === 'SUPER_ADMIN' ? 'Ketua Panitia' : 
             user.role === 'KOORDINATOR_DIVISI' ? 'Koordinator' : 
             user.role === 'PJ' ? 'Penanggung Jawab' : 
             user.role}
          </span>
        </div>
        <form action={customSignOut}>
          <button 
            type="submit"
            className="text-body hover:text-primary transition-colors cursor-pointer" 
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
