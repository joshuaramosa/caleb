import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { SalesView } from "@/components/admin/sales-view";
import type { OrderWithDetails, Payment } from "@/types";

export const metadata = { title: "Ventas y Reportes — Don Caleb Admin" };

type RawOrder = Omit<OrderWithDetails, "payment"> & {
  payment?: Payment[] | Payment | null;
};

export default async function AdminVentasPage() {
  await requireRole(["ADMIN"]);
  const supabase = await createClient();

  const { data: ordersData } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(*),
      payment:payments(*)
    `)
    .order("created_at", { ascending: false });

  const orders: OrderWithDetails[] = (
    (ordersData ?? []) as unknown as RawOrder[]
  ).map((o) => ({
    ...o,
    payment: Array.isArray(o.payment) ? o.payment[0] : (o.payment ?? undefined),
  }));

  return (
    <main className="max-w-6xl mx-auto p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Ventas y Reportes</h1>
        <p className="text-xs text-muted-foreground">
          Rendimiento comercial, canales de pago y platos estrella
        </p>
      </div>

      <SalesView orders={orders} />
    </main>
  );
}
