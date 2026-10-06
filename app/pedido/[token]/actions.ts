"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type CancelResult =
  | { ok: true; penalized: boolean; debt: number }
  | { ok: false; error: string };

/**
 * Cancelación por el cliente desde su enlace de seguimiento.
 * La regla (gratis antes de cocina / suspensión con deuda después)
 * vive en el RPC cancel_order_by_client.
 */
export async function cancelOrderByClient(token: string): Promise<CancelResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("cancel_order_by_client", {
    p_token: token,
  });

  if (error) {
    console.error("[cancelOrderByClient] Error RPC:", error.message, error);
    if (error.message.includes("YA_NO_CANCELABLE"))
      return { ok: false, error: "Este pedido ya no se puede cancelar." };
    if (error.message.includes("PEDIDO_NO_ENCONTRADO"))
      return { ok: false, error: "No encontramos este pedido." };
    return { ok: false, error: "No pudimos cancelar el pedido. Inténtalo de nuevo." };
  }

  const result = data as { penalized: boolean; debt: number };
  revalidatePath(`/pedido/${token}`);
  return { ok: true, penalized: result.penalized, debt: Number(result.debt) };
}
