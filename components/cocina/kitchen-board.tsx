"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Volume2, VolumeX, Flame, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRealtime, type RealtimeEventPayload } from "@/hooks/use-realtime";
import { playBeep } from "@/lib/sound";
import { startPreparing, markReady } from "@/app/cocina/actions";
import type { OrderWithDetails } from "@/types";

function minutesSince(isoDate: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000));
}

export function KitchenBoard({ initialOrders }: { initialOrders: OrderWithDetails[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [prevProps, setPrevProps] = useState(initialOrders);
  if (prevProps !== initialOrders) {
    setPrevProps(initialOrders);
    setOrders(initialOrders);
  }

  const SOUND_KEY = "caleb-cocina-sonido";
  const soundIsOn = () =>
    typeof window !== "undefined" && localStorage.getItem(SOUND_KEY) !== "off";
  const [soundOn, setSoundOn] = useState(() => {
    if (typeof window !== "undefined") {
      return soundIsOn();
    }
    return true;
  });
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [, setTick] = useState(0); // re-render cada minuto para actualizar "hace X min"

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Realtime: pedidos que llegan a cocina o cambian de estado
  const onPayload = useCallback(
    (_sub: unknown, payload: RealtimeEventPayload) => {
      const updated = payload.new as { id: string; status: string };
      if (updated.status === "CONFIRMADO") {
        if (soundIsOn()) playBeep();
        toast.info("🔔 Pedido nuevo para preparar");
      }
      router.refresh();
    },
    [router],
  );
  useRealtime("cocina-pedidos", [{ table: "orders" }], onPayload, () => router.refresh());

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      localStorage.setItem("caleb-cocina-sonido", next ? "on" : "off");
      if (next) playBeep(); // probar al activar
      return next;
    });
  }, []);

  const doAction = async (
    orderId: string,
    action: typeof startPreparing,
    successLabel: string,
  ) => {
    setLoadingId(orderId);
    const res = await action(orderId);
    setLoadingId(null);
    if (res && "error" in res && res.error) toast.error(res.error);
    else {
      toast.success(successLabel);
      router.refresh();
    }
  };

  const pending = orders.filter((o) => o.status === "CONFIRMADO");
  const cooking = orders.filter((o) => o.status === "EN_PREPARACION");

  const OrderCard = ({ order }: { order: OrderWithDetails }) => {
    const mins = minutesSince(order.created_at);
    const isCooking = order.status === "EN_PREPARACION";
    return (
      <Card className="overflow-hidden border-2 border-foreground/10">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black">
              #{String(order.order_number).padStart(3, "0")}
            </p>
            <span
              className={`rounded-full px-3 py-1 text-sm font-bold ${
                mins >= 15 ? "bg-red-100 text-red-700" : "bg-muted text-muted-foreground"
              }`}
            >
              ⏱ {mins} min
            </span>
          </div>

          <ul className="flex flex-col gap-1.5 text-2xl font-semibold leading-tight">
            {order.items.map((item, i) => (
              <li key={i}>
                <span className="text-caleb-600">{item.quantity}×</span> {item.product_name}
                {item.notes && (
                  <span className="block text-sm font-normal text-muted-foreground">
                    nota: {item.notes}
                  </span>
                )}
              </li>
            ))}
          </ul>

          <Button
            size="lg"
            disabled={loadingId === order.id}
            onClick={() =>
              isCooking
                ? doAction(order.id, markReady, "Pedido marcado como LISTO")
                : doAction(order.id, startPreparing, "Preparando pedido")
            }
            className={`h-16 w-full text-xl font-bold ${
              isCooking ? "bg-green-600 hover:bg-green-700" : ""
            }`}
          >
            {isCooking ? (
              <>
                <CheckCircle2 className="mr-2 size-7" aria-hidden /> PEDIDO LISTO
              </>
            ) : (
              <>
                <Flame className="mr-2 size-7" aria-hidden /> PREPARAR
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-md md:max-w-3xl xl:max-w-5xl flex-1 flex-col gap-4 p-4 pb-8 lg:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {orders.length} pedido(s) en cola
        </p>
        <Button variant="outline" size="sm" onClick={toggleSound} aria-pressed={soundOn}>
          {soundOn ? (
            <>
              <Volume2 className="mr-1 size-4" aria-hidden /> Sonido activado
            </>
          ) : (
            <>
              <VolumeX className="mr-1 size-4" aria-hidden /> Sonido desactivado
            </>
          )}
        </Button>
      </div>

      {orders.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-5xl" aria-hidden>👨‍🍳</p>
          <p className="font-semibold">Sin pedidos pendientes</p>
          <p className="text-sm text-muted-foreground">
            Te avisaremos con un sonido cuando llegue uno nuevo.
          </p>
        </div>
      )}

      {/* Tablet/PC: dos columnas (solicitados | preparando) */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start">
        {pending.length > 0 && (
          <section aria-label="Pendientes de preparar" className="flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              🆕 Por preparar ({pending.length})
            </h2>
            {pending.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </section>
        )}

        {cooking.length > 0 && (
          <section aria-label="En preparación" className="flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              🔥 En preparación ({cooking.length})
            </h2>
            {cooking.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
