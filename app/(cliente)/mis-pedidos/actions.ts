"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type OrderSummary = {
  token: string;
  number: number;
  status: string;
  total: number;
  createdAt: string;
};

/** Resumen de pedidos por token de seguimiento (solo lo que el cliente ya posee). */
export async function getOrderSummaries(tokens: string[]): Promise<OrderSummary[]> {
  if (!tokens.length) return [];
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("tracking_token, order_number, status, total, created_at")
    .in("tracking_token", tokens);

  return (data ?? []).map((o) => ({
    token: o.tracking_token,
    number: o.order_number,
    status: o.status,
    total: Number(o.total),
    createdAt: o.created_at,
  }));
}
