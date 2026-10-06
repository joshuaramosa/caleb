import { createClient } from "@/lib/supabase/server";
import { KitchenBoard } from "@/components/cocina/kitchen-board";
import type { OrderWithDetails } from "@/types";

export const metadata = { title: "Cocina — CALEB" };
export const dynamic = "force-dynamic";

export default async function CocinaPage() {
  const supabase = await createClient();

  // Solo confirmados o en preparación; en orden de llegada (nunca se reordena).
  // Solo lo que cocina necesita: ítems. Sin precios ni datos del cliente.
  const { data } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, created_at, items:order_items(product_name, quantity, notes)",
    )
    .in("status", ["CONFIRMADO", "EN_PREPARACION"])
    .order("created_at", { ascending: true });

  return <KitchenBoard initialOrders={(data ?? []) as unknown as OrderWithDetails[]} />;
}
