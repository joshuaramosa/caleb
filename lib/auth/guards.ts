import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { homeByRole, type UserRole } from "@/lib/auth/roles";

/**
 * Verificación de rol en el servidor (defensa en profundidad junto al proxy).
 * Redirige a /admin/login si no hay sesión, o al panel del rol si no corresponde.
 */
export async function requireRole(allowed: UserRole[]) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const { data: staff } = await supabase
    .from("users")
    .select("id, role, is_active, full_name")
    .eq("id", data.user.id)
    .single();

  // Usuario desactivado: NO redirigir a homeByRole (genera bucle, el destino
  // pasa por este mismo guard). Se manda al login, que lo muestra sin redirect.
  if (!staff || !staff.is_active) {
    redirect("/admin/login");
  }

  if (!allowed.includes(staff.role as UserRole)) {
    redirect(homeByRole(staff.role as UserRole));
  }

  return staff as { id: string; role: UserRole; is_active: boolean; full_name: string };
}

/**
 * Verificación de rol para server actions: NO redirige, devuelve error.
 * Usar en toda acción que toque datos sensibles.
 */
export async function requireStaffRole(allowed: UserRole[]) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "No autorizado" as const, role: null, userId: null };

  const { data: staff } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("id", data.user.id)
    .single();

  if (!staff || !staff.is_active || !allowed.includes(staff.role as UserRole)) {
    return { error: "No tienes permiso para hacer esto." as const, role: null, userId: null };
  }
  return { error: null, role: staff.role as UserRole, userId: data.user.id };
}
