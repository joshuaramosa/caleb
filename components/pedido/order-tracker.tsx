"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { OrderStatus } from "@/types";

// Máquina de estados en orden (CANCELADO se muestra aparte)
const FLOW = [
  "NUEVO",
  "CONFIRMADO",
  "EN_PREPARACION",
  "LISTO",
  "ASIGNADO",
  "EN_CAMINO",
  "ENTREGADO",
] as const;

const LABELS: Record<string, string> = {
  NUEVO: "Recibido",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparación",
  LISTO: "Listo para reparto",
  ASIGNADO: "Repartidor asignado",
  EN_CAMINO: "En camino 🛵",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export function OrderTracker({
  initialStatus,
}: {
  orderId: string;
  initialStatus: OrderStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [prevStatus, setPrevStatus] = useState<OrderStatus>(initialStatus);

  // Sincronizar con datos del servidor tras refresh (adjust-during-render)
  if (prevStatus !== initialStatus) {
    setPrevStatus(initialStatus);
    setStatus(initialStatus);
  }

  // Polling cada 15 s: el canal anónimo no tiene acceso a `orders` por RLS,
  // así que el seguimiento público refresca la página en segundo plano.
  useEffect(() => {
    const poll = setInterval(() => router.refresh(), 15000);
    const onVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  const cancelled = status === "CANCELADO";
  const currentIndex = FLOW.indexOf(status as (typeof FLOW)[number]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold">
            Estado: <span className="text-caleb-600">{LABELS[status]}</span>
          </p>
          <span className="text-xs text-green-600" title="Se actualiza automáticamente">
            ● auto
          </span>
        </div>

        {cancelled ? (
          <Badge variant="destructive">Pedido cancelado — comunícate con el local</Badge>
        ) : (
          <div className="flex flex-col gap-0">
            {FLOW.map((step, i) => {
              const done = i < currentIndex;
              const current = i === currentIndex;
              return (
                <div key={step} className="flex items-center gap-3 py-1.5">
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${
                      done
                        ? "bg-green-500 text-white"
                        : current
                          ? "animate-pulse bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                    aria-hidden
                  >
                    {done ? "✓" : current ? "●" : "○"}
                  </span>
                  <span
                    className={
                      current ? "font-semibold" : done ? "" : "text-muted-foreground"
                    }
                  >
                    {LABELS[step]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
