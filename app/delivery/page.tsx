import { createClient } from "@/lib/supabase/server";
import { DeliveryBoard, type AssignedDelivery } from "@/components/delivery/delivery-board";
import { DriverCash, type TodayDelivery } from "@/components/delivery/driver-cash";
import { startOfTodayLimaISO } from "@/lib/business";
import type { CashSummary } from "./actions";

export const metadata = { title: "Delivery — CALEB" };
export const dynamic = "force-dynamic";

export default async function DeliveryPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("delivery_assignments")
    .select(
      `*,
      orders(
        *,
        customer:customers(*),
        address:addresses(*),
        items:order_items(*)
      )`,
    )
    .eq("delivery_user_id", auth.user?.id ?? "")
    .neq("status", "ENTREGADO")
    .order("assigned_at", { ascending: true });

  // Historial del día: mis entregas ENTREGADAS hoy (hora Perú)
  const { data: doneData } = await supabase
    .from("delivery_assignments")
    .select("delivered_at, orders(order_number, total, payment_method, customer:customers(full_name))")
    .eq("delivery_user_id", auth.user?.id ?? "")
    .eq("status", "ENTREGADO")
    .gte("delivered_at", startOfTodayLimaISO())
    .order("delivered_at", { ascending: false });

  // Caja: efectivo contra-entrega pendiente de rendir (RPC usa auth.uid())
  const { data: cashData } = await supabase.rpc("get_my_cash_summary");

  return (
    <>
      <DeliveryBoard initial={(data ?? []) as unknown as AssignedDelivery[]} />
      <DriverCash
        cash={(cashData as CashSummary | null) ?? null}
        today={(doneData ?? []) as unknown as TodayDelivery[]}
      />
    </>
  );
}
