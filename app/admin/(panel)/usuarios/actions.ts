"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types";

export async function createStaffMember(formData: FormData) {
  const supabase = await createClient();
  const { data: userAuth } = await supabase.auth.getUser();

  // Verificar que quien llama sea ADMIN
  const { data: adminUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", userAuth.user?.id ?? "")
    .single();

  if (adminUser?.role !== "ADMIN") {
    return { error: "Solo los administradores pueden registrar nuevo personal." };
  }

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string)?.trim();
  const full_name = (formData.get("full_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const role = (formData.get("role") as string) as UserRole;

  if (!email || !password || !full_name || !role) {
    return { error: "Todos los campos obligatorios deben completarse." };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const adminClient = createAdminClient();

  // 1. Crear en Supabase Auth
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  });

  if (authError || !authUser.user) {
    return { error: authError?.message || "Error al crear la cuenta de usuario." };
  }

  // 2. Insertar o actualizar en tabla users
  const { error: dbError } = await adminClient.from("users").upsert({
    id: authUser.user.id,
    full_name,
    phone,
    role,
    is_active: true,
  });

  if (dbError) {
    return { error: dbError.message };
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/pedidos");
  return { success: true };
}

export async function updateStaffMember(formData: FormData) {
  const supabase = await createClient();
  const { data: userAuth } = await supabase.auth.getUser();

  const { data: adminUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", userAuth.user?.id ?? "")
    .single();

  if (adminUser?.role !== "ADMIN") {
    return { error: "Solo los administradores pueden editar personal." };
  }

  const id = formData.get("id") as string;
  const full_name = (formData.get("full_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const role = (formData.get("role") as string) as UserRole;
  const is_active = formData.get("is_active") === "true";

  if (!id || !full_name || !role) {
    return { error: "Datos incompletos." };
  }

  const { error } = await supabase
    .from("users")
    .update({ full_name, phone, role, is_active })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/pedidos");
  return { success: true };
}

export async function toggleStaffActive(userId: string, current: boolean) {
  const supabase = await createClient();
  const { data: userAuth } = await supabase.auth.getUser();

  // Consistente con create/update: solo ADMIN gestiona el personal
  const { data: adminUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", userAuth.user?.id ?? "")
    .single();

  if (adminUser?.role !== "ADMIN") {
    return { error: "Solo los administradores pueden activar o desactivar personal." };
  }

  if (userAuth.user?.id === userId) {
    return { error: "No puedes desactivar tu propia cuenta." };
  }

  const { error } = await supabase
    .from("users")
    .update({ is_active: !current })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/usuarios");
  return { success: true };
}
