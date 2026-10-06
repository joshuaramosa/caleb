"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, ReceiptText, CircleUserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Inicio", icon: Home, exact: true },
  { href: "/carta", label: "Carta", icon: BookOpen, exact: false },
  { href: "/mis-pedidos", label: "Pedidos", icon: ReceiptText, exact: false },
  { href: "/perfil", label: "Perfil", icon: CircleUserRound, exact: false },
];

/** Barra de navegaci��n inferior fija para la zona pǧblica del cliente. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegaci��n principal del cliente"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-gradient-to-b from-[#141a26] to-[#0b0e14] shadow-[0_-4px_20px_rgba(0,0,0,0.35)] backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 pt-1.5">
        {TABS.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-[11px] transition-all duration-200",
                active
                  ? "bg-[#F0A000] font-bold text-white shadow-lg shadow-[#F0A000]/40"
                  : "font-medium text-stone-400 hover:text-stone-100",
              )}
            >
              <Icon className={cn("size-6", active && "stroke-[2.2]")} aria-hidden />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
