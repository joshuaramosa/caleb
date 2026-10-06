import { createClient } from "@/lib/supabase/server";
import { CustomersView } from "@/components/admin/customers-view";
import type { Customer, OrderWithDetails } from "@/types";

export const metadata = { title: "Clientes — Don Caleb Admin" };

type CustomerWithOrders = Customer & { orders: OrderWithDetails[] };

export default async function AdminClientesPage() {
  const supabase = await createClient();

  // Obtener clientes con pedidos e ítems
  const { data: customersData } = await supabase
    .from("customers")
    .select(`
      *,
      orders:orders(
        *,
        items:order_items(*)
      )
    `)
    .order("created_at", { ascending: false });

  const customers: CustomerWithOrders[] = (
    (customersData ?? []) as CustomerWithOrders[]
  ).map((c) => ({
    ...c,
    orders: (c.orders ?? []).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    ),
  }));

  return (
    <main className="max-w-6xl mx-auto p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Directorio de Clientes</h1>
        <p className="text-xs text-muted-foreground">
          Historial de compras y contacto directo por llamada o WhatsApp
        </p>
      </div>

      <CustomersView customers={customers} />
    </main>
  );
}
