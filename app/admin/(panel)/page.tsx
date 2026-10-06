import { createClient } from "@/lib/supabase/server";
import { DashboardView } from "@/components/admin/dashboard-view";
import { isOpenNow, startOfTodayLimaISO } from "@/lib/business";
import type { Settlement } from "@/app/admin/(panel)/pedidos/actions";
import { CashSettlementsCard } from "@/components/admin/cash-settlements-card";
import type {
  OrderWithDetails,
  StaffUser,
  BusinessSettings,
  Payment,
  DeliveryAssignment,
} from "@/types";

export const metadata = { title: "Dashboard — Don Caleb Admin" };

// Supabase puede devolver relaciones 1:1 como array o como objeto
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

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. Configuración del negocio y estado
  const { data: settingsData } = await supabase
    .from("business_settings")
    .select("*")
    .eq("id", 1)
    .single();

  const settings: BusinessSettings = settingsData || {
    id: 1,
    business_name: "Pollería Don Caleb",
    whatsapp: "986749190",
    yape_number: null,
    yape_holder: null,
    delivery_fee: 2.0,
    open_time: "12:00",
    close_time: "22:30",
    is_open: true,
    logo_url: null,
    qr_url: null,
    store_lat: null,
    store_lng: null,
  };

  const businessIsOpen = isOpenNow(settings);

  // 2. Pedidos de hoy (00:00 hora Perú). Antes se traían los últimos 100 de
  // la historia completa y el dashboard los contaba como "de hoy".
  const { data: ordersData } = await supabase
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
    .gte("created_at", startOfTodayLimaISO())
    .order("created_at", { ascending: false })
    .limit(200);

  const orders: OrderWithDetails[] = normalizeOrders(
    (ordersData ?? []) as unknown as RawOrder[],
  );

  // 3. Repartidores disponibles (incluye ADMIN: también puede hacer repartos)
  const { data: staffData } = await supabase
    .from("users")
    .select("*")
    .in("role", ["REPARTIDOR", "ADMIN"])
    .eq("is_active", true)
    .order("full_name");

  const repartidores: StaffUser[] = staffData || [];

  // 4. Rendiciones de efectivo de repartidores
  const { data: settlementsData } = await supabase.rpc("get_settlements");

  return (
    <main className="max-w-6xl mx-auto p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Inicio</h1>
          <p className="text-xs text-muted-foreground">
            Resumen operativo y despacho en tiempo real
          </p>
        </div>
      </div>

      <CashSettlementsCard
        settlements={((settlementsData as { settlements?: Settlement[] } | null)?.settlements) ?? []}
      />

      <DashboardView
        ordersToday={orders}
        repartidores={repartidores}
        businessIsOpen={businessIsOpen}
      />

    </main>
  );
}
