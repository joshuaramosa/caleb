"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { getSavedOrders, removeSavedOrder, type SavedOrder } from "@/lib/order-memory";
import { getOrderSummaries, type OrderSummary } from "./actions";
import { formatSoles } from "@/lib/business";

const STATUS_LABEL: Record<string, string> = {
  NUEVO: "🆕 Recibido",
  CONFIRMADO: "✅ Confirmado",
  EN_PREPARACION: "🔥 En preparación",
  LISTO: "✅ Listo",
  ASIGNADO: "🛵 Repartidor asignado",
  EN_CAMINO: "🛵 En camino",
  ENTREGADO: "🎉 Entregado",
  CANCELADO: "⛔ Cancelado",
};

// Colores por estado: entregado en verde, cancelado en rojo, resto neutro.
const STATUS_STYLE: Record<string, string> = {
  ENTREGADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-600",
};

export default function MisPedidosPage() {
  const mounted = useMounted();
  const [orders, setOrders] = useState<(SavedOrder & { summary?: OrderSummary })[]>([]);

  useEffect(() => {
    if (!mounted) return;

    let alive = true;
    const load = async () => {
      const saved = getSavedOrders();
      if (!saved.length) {
        if (alive) setOrders([]);
        return;
      }
      const summaries = await getOrderSummaries(saved.map((o) => o.token));
      if (!alive) return;
      const byToken = new Map(summaries.map((s) => [s.token, s]));
      // Depura pedidos que ya no existen en el servidor (p. ej. borrados de la BD):
      // se quitan del teléfono para no mostrar enlaces rotos (404).
      const valid = saved.filter((o) => {
        if (byToken.has(o.token)) return true;
        removeSavedOrder(o.token);
        return false;
      });
      setOrders(valid.map((o) => ({ ...o, summary: byToken.get(o.token) })));
    };

    queueMicrotask(load); // primera carga
    const id = setInterval(load, 30000); // refresco cada 30 s
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 p-4">
      <header className="pt-2">
        <h1 className="text-xl font-bold">🧾 Mis pedidos</h1>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-5xl" aria-hidden>🍗</p>
          <p className="font-semibold">No tienes pedidos en este teléfono</p>
          <p className="text-sm text-muted-foreground">
            Cuando hagas tu primer pedido, aquí podrás seguirlo.
          </p>
          <Button asChild size="lg" className="mt-2">
            <Link href="/carta">Ver la carta</Link>
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {orders.map((o) => (
            <li key={o.token}>
              <Link
                href={`/pedido/${o.token}`}
                className="flex items-center justify-between gap-3 rounded-lg border p-4"
              >
                <div>
                  <p className="font-bold">#{String(o.number).padStart(3, "0")}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.placedAt).toLocaleString("es-PE", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "America/Lima",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs font-bold rounded-full px-2.5 py-1 ${
                      o.summary
                        ? STATUS_STYLE[o.summary.status] ?? "bg-muted text-muted-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {o.summary ? STATUS_LABEL[o.summary.status] ?? o.summary.status : "…"}
                  </span>
                  <span className="text-sm font-bold text-caleb-600">
                    {formatSoles(o.summary?.total ?? o.total)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {orders.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          La lista se actualiza sola cada 30 segundos.
        </p>
      )}
    </main>
  );
}
