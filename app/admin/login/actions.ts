"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/server";
import { homeByRole, type UserRole } from "@/lib/auth/roles";

/** 30 días de sesión persistente cuando el usuario marca "Guardar sesión". */
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30;

export async function login(prevState: { error: string } | null, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";

  if (!email || !password) {
    return { error: "Ingresa tu correo y contrase��a." };
  }

  // Cliente propio para controlar la duración de la cookie de sesión:
  // con "Guardar sesión" dura 30 días (entra directo la próxima vez);
  // sin marcar, la cookie muere al cerrar el navegador.
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) =>
              cookieStore.set(
                name,
                value,
                remember
                  ? { ...options, maxAge: REMEMBER_MAX_AGE }
                  : { ...options, maxAge: undefined, expires: undefined },
              ),
            );
          } catch {
            // contexto de Server Component; el proxy refresca la sesión.
          }
        },
      },
    },
  );
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Correo o contraseña incorrectos." };
  }

  const { data: staff } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .single();

  if (!staff || !staff.is_active) {
    await supabase.auth.signOut();
    return { error: "Tu cuenta no tiene acceso al panel." };
  }

  redirect(homeByRole(staff.role as UserRole));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
