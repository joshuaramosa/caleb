"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStaffRole } from "@/lib/auth/guards";

/**
 * Reactivar un cliente suspendido (tras confirmar que pagó su deuda por WhatsApp).
 * Limpia el bloqueo: el número vuelve a poder pedir.
 */
export async function unblockCustomer(customerId: string) {
  const auth = await requireStaffRole(["ADMIN", "ATENCION"]);
  if (auth.error) return auth;

  const supabase = await createClient();
  const { error } = await supabase
    .from("customers")
    .update({
      is_blocked: false,
      blocked_at: null,
      blocked_reason: null,
      blocked_debt: 0,
    })
    .eq("id", customerId);

  if (error) return { error: error.message };

  revalidatePath("/admin/clientes");
  return { success: true };
}
