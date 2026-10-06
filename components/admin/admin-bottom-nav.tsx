"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Users,
  TrendingUp,
  Settings,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  {
    label: "Inicio",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
    roles: null, // ambos roles del panel
  },
  {
    label: "Pedidos",
    href: "/admin/pedidos",
    icon: ShoppingBag,
    exact: false,
    roles: null,
  },
  {
    label: "Carta",
    href: "/admin/productos",
    icon: UtensilsCrossed,
    exact: false,
    roles: ["ADMIN"],
  },
  {
    label: "Clientes",
    href: "/admin/clientes",
    icon: Users,
    exact: false,
    roles: null,
  },
  {
    label: "Ventas",
    href: "/admin/ventas",
    icon: TrendingUp,
    exact: false,
    roles: ["ADMIN"],
  },
  {
    label: "Promos",
    href: "/admin/promociones",
    icon: Megaphone,
    exact: false,
    roles: ["ADMIN"],
  },
  {
    label: "Ajustes",
    href: "/admin/configuracion",
    icon: Settings,
    exact: false,
    roles: ["ADMIN"],
  },
];

export function AdminBottomNav({ role = "ADMIN" }: { role?: string }) {
  const pathname = usePathname();
  // Solo mostrar los módulos que el rol realmente puede usar
  const items = NAV_ITEMS.filter((i) => !i.roles || i.roles.includes(role));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-gradient-to-b from-[#141a26] to-[#0b0e14] shadow-[0_-4px_20px_rgba(0,0,0,0.35)] backdrop-blur-md pb-safe md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
        {items.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 text-[11px] transition-all duration-200 touch-manipulation active:scale-95",
                isActive
                  ? "bg-[#F0A000] font-bold text-white shadow-lg shadow-[#F0A000]/40"
                  : "font-medium text-stone-400 hover:text-stone-100"
              )}
            >
              <div className="flex h-6 w-6 items-center justify-center">
                <Icon className={cn("h-4.5 w-4.5", isActive && "stroke-[2.5px]")} />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
