import { createClient } from "@/lib/supabase/server";
import { OrdersListView } from "@/components/admin/orders-list-view";
import type {
  OrderWithDetails,
  StaffUser,
  Payment,
  DeliveryAssignment,
} from "@/types";

export const metadata = { title: "Gestión de Pedidos — CALEB" };

type RawOrder = Omit<OrderWithDetails, "payment" | "delivery_assignment"> & {
  payment?: Payment[] | Payment | null;
  delivery_assignment?: DeliveryAssignment[] | DeliveryAssignment | null;
};

function normalizeOrders(raw: RawOrder[]): OrderWithDetails[] {
  return raw.map((o) => ({
    ...o,
    payment: Array.isArray(o.payment) ? o.payment[0] : (o.payment ?? undefined),
    delivery_assignment: Array.isArray(o.delivery_assignment)
      ? o.delivery_assignment[0]
      : (o.delivery_assignment ?? undefined),
  }));
}

export default async function AdminPedidosPage() {
  const supabase = await createClient();

  // Obtener pedidos con relaciones
  const { data: ordersData, error } = await supabase
    .from("orders")
    .select(`
      *,
      customer:customers(*),
      address:addresses(*),
      items:order_items(*),
      payment:payments(*),
      delivery_assignment:delivery_assignments(
        *,
        delivery_user:users(*)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al cargar pedidos:", error);
  }

  // Normalizar pagos y asignaciones (Supabase puede devolver arrays para relaciones 1 a 1 o 1 a N)
  const orders: OrderWithDetails[] = normalizeOrders(
    (ordersData ?? []) as unknown as RawOrder[],
  );

  // Obtener repartidores activos (incluye ADMIN: también puede hacer repartos)
  const { data: staffData } = await supabase
    .from("users")
    .select("*")
    .in("role", ["REPARTIDOR", "ADMIN"])
    .eq("is_active", true)
    .order("full_name");

  const repartidores: StaffUser[] = staffData || [];

  return (
    <main className="max-w-6xl mx-auto p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-xs text-muted-foreground">
            Control de pedidos, pagos y asignación de repartos
          </p>
        </div>
      </div>

      <OrdersListView
        initialOrders={orders}
        repartidores={repartidores}
      />
    </main>
  );
}
