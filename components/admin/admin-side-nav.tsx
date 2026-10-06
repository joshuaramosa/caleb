"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalebLogo } from "@/components/ui/caleb-logo";
import { NAV_ITEMS } from "@/components/admin/admin-bottom-nav";
import { cn } from "@/lib/utils";

/** Barra lateral del panel: solo visible en computadora/tablet (md+). */
export function AdminSideNav({ role = "ADMIN" }: { role?: string }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((i) => !i.roles || i.roles.includes(role));

  return (
    <aside
      aria-label="Navegación del panel"
      className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-gradient-to-b from-[#141a26] to-[#0b0e14] md:flex"
    >
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <CalebLogo size="xs" asLink href="/admin" />
        <div>
          <p className="text-sm font-bold text-white leading-tight">Pollería Don Caleb</p>
          <p className="text-[11px] text-stone-400">Panel administrativo</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
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
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200",
                isActive
                  ? "bg-[#F0A000] font-bold text-white shadow-lg shadow-[#F0A000]/40"
                  : "font-medium text-stone-400 hover:bg-white/5 hover:text-stone-100"
              )}
            >
              <Icon className={cn("size-5", isActive && "stroke-[2.5px]")} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
