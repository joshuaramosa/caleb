"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireKitchenStaff() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "No autorizado" as const, userId: null };

  const { data: staff } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("id", data.user.id)
    .single();

  if (!staff || !staff.is_active || !["COCINA", "ADMIN"].includes(staff.role)) {
    return { error: "Solo cocina puede hacer esto.", userId: null };
  }
  return { error: null, userId: data.user.id };
}

/** CONFIRMADO → EN_PREPARACION */
export async function startPreparing(orderId: string) {
  const auth = await requireKitchenStaff();
  if (auth.error) return auth;

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: "EN_PREPARACION", updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("status", "CONFIRMADO"); // solo desde el estado correcto

  if (error) return { error: error.message };
  revalidatePath("/cocina");
  revalidatePath("/admin/pedidos");
  return { success: true };
}

/** EN_PREPARACION → LISTO */
export async function markReady(orderId: string) {
  const auth = await requireKitchenStaff();
  if (auth.error) return auth;

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: "LISTO", updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("status", "EN_PREPARACION");

  if (error) return { error: error.message };
  revalidatePath("/cocina");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  return { success: true };
}
