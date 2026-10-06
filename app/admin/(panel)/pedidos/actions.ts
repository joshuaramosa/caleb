"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffRole } from "@/lib/auth/guards";
import type { OrderStatus, PaymentStatus } from "@/types";

/**
 * Cambiar estado de un pedido (ej. NUEVO -> CONFIRMADO, CONFIRMADO -> EN_PREPARACION, etc.)
 * Solo personal del panel (ADMIN / ATENCION).
 */
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const auth = await requireStaffRole(["ADMIN", "ATENCION"]);
  if (auth.error) return auth;

  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath("/cocina");
  revalidatePath("/delivery");
  return { success: true };
}

export type Settlement = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  confirmed_at: string | null;
  driver_name: string;
  orders: { order_number: number; total: number }[];
};

/** Rendiciones de efectivo de los repartidores (ADMIN/ATENCION) */
export async function getSettlements() {
  const auth = await requireStaffRole(["ADMIN", "ATENCION"]);
  if (auth.error) return auth;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_settlements");
  if (error) return { error: error.message };
  return { settlements: (data as { settlements: Settlement[] }).settlements ?? [] };
}

/** Confirmar que el repartidor entregó el efectivo */
export async function confirmSettlement(id: string) {
  const auth = await requireStaffRole(["ADMIN", "ATENCION"]);
  if (auth.error) return auth;

  const supabase = await createClient();
  const { error } = await supabase.rpc("confirm_settlement", { p_id: id });
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  return { success: true };
}

/**
 * Verificar o rechazar comprobante de pago Yape
 */
export async function verifyPaymentProof(orderId: string, status: PaymentStatus) {
  const auth = await requireStaffRole(["ADMIN", "ATENCION"]);
  if (auth.error) return auth;

  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .update({
      status,
      verified_by: auth.userId,
      verified_at: new Date().toISOString(),
    })
    .eq("order_id", orderId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  return { success: true };
}

/**
 * Asignar repartidor a un pedido
 */
export async function assignDelivery(orderId: string, deliveryUserId: string) {
  const auth = await requireStaffRole(["ADMIN", "ATENCION"]);
  if (auth.error) return auth;

  const supabase = await createClient();

  // Comprobar si ya existe asignación
  const { data: existing } = await supabase
    .from("delivery_assignments")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("delivery_assignments")
      .update({
        delivery_user_id: deliveryUserId,
        status: "ASIGNADO",
      })
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("delivery_assignments").insert({
      order_id: orderId,
      delivery_user_id: deliveryUserId,
      status: "ASIGNADO",
    });

    if (error) return { error: error.message };
  }

  // También actualizar el estado del pedido a ASIGNADO si estaba en LISTO o CONFIRMADO
  await supabase
    .from("orders")
    .update({ status: "ASIGNADO", updated_at: new Date().toISOString() })
    .eq("id", orderId);

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath("/delivery");
  return { success: true };
}

/**
 * Generar enlace firmado para visualizar comprobante de Yape (bucket privado payment-proofs)
 */
export async function getPaymentProofUrl(rawPath: string) {
  // Clave: NUNCA firmar URLs del bucket privado sin verificar rol
  const auth = await requireStaffRole(["ADMIN", "ATENCION"]);
  if (auth.error) return { url: null, error: auth.error };
  if (!rawPath) return { url: null };

  // Si ya es una URL pública completa o externa
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
    return { url: rawPath };
  }

  const adminClient = createAdminClient();
  // Limpiar nombre de bucket si viene incluido en la ruta
  const cleanPath = rawPath.replace(/^payment-proofs\//, "");

  const { data, error } = await adminClient.storage
    .from("payment-proofs")
    .createSignedUrl(cleanPath, 3600); // 1 hora de validez

  if (error || !data?.signedUrl) {
    return { url: null, error: error?.message };
  }

  return { url: data.signedUrl };
}
