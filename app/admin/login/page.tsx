import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { homeByRole, type UserRole } from "@/lib/auth/roles";
import { LoginForm } from "./login-form";

export const metadata = { title: "Iniciar sesión — CALEB" };

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    const { data: staff } = await supabase
      .from("users")
      .select("role, is_active")
      .eq("id", data.user.id)
      .single();
    // Solo redirigir si el personal está ACTIVO; si está desactivado se muestra
    // el formulario (evita el bucle: guard -> login -> home -> guard -> …)
    if (staff?.is_active) {
      redirect(homeByRole(staff.role as UserRole));
    }
  }

  return (
    <main className="flex flex-1 min-h-screen items-center justify-center p-4 bg-gradient-to-b from-caleb-50 to-background">
      <LoginForm />
    </main>
  );
}
