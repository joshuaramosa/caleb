"use client";

import { useTransition } from "react";
import { logout } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      onClick={() => startTransition(() => logout())}
      disabled={pending}
    >
      {pending ? "Saliendo…" : "Cerrar sesión"}
    </Button>
  );
}
