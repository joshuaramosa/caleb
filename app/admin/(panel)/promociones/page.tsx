import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { PromotionsView } from "@/components/admin/promotions-view";
import type { Promotion } from "@/types";

export const metadata = { title: "Promociones — Don Caleb Admin" };
export const dynamic = "force-dynamic";

/** Carrusel de promociones del Inicio: gestión exclusiva del rol ADMIN. */
export default async function AdminPromocionesPage() {
  await requireRole(["ADMIN"]);

  const supabase = await createClient();
  const { data } = await supabase
    .from("promotions")
    .select("*")
    .order("sort_order", { ascending: true });

  const promotions: Promotion[] = (data ?? []) as Promotion[];

  return (
    <main className="max-w-6xl mx-auto space-y-4 p-4 lg:p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Promociones</h1>
        <p className="text-xs text-muted-foreground">
          Hasta 5 imágenes: salen en el Inicio como un reel que cambia solo cada 5 segundos
        </p>
      </div>

      <PromotionsView promotions={promotions} />
    </main>
  );
}
