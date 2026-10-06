import type { ReactNode } from "react";
import { LogoutButton } from "@/components/logout-button";
import { CalebLogo } from "@/components/ui/caleb-logo";
import { Badge } from "@/components/ui/badge";

export function StaffHeader({
  title,
  name,
  role,
  actions,
}: {
  title: string;
  name: string;
  role: string;
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-2.5 backdrop-blur shadow-xs">
      <div className="flex items-center gap-3">
        <CalebLogo size="xs" priority asLink href="/" />
        <div className="border-l border-border pl-3">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm sm:text-base font-bold leading-tight">{title}</h1>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 border-caleb-gold-500/40 text-caleb-gold-700 dark:text-caleb-gold-300"
            >
              {role}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">Hola, {name}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {actions}
        <LogoutButton />
      </div>
    </header>
  );
}
