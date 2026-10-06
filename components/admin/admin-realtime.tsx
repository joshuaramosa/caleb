"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Volume2, VolumeX } from "lucide-react";
import { useRealtime, type RealtimeEventPayload } from "@/hooks/use-realtime";
import { playBeep } from "@/lib/sound";
import { formatSoles } from "@/lib/business";

const SOUND_KEY = "caleb-admin-sonido";
const soundIsOn = () =>
  typeof window !== "undefined" && localStorage.getItem(SOUND_KEY) !== "off";

/**
 * Escucha pedidos en tiempo real para Admin/Atención:
 * - INSERT → toast 🔔 NUEVO PEDIDO + sonido
 * - Cualquier cambio → refresh de datos del panel
 */
export function AdminRealtime() {
  const router = useRouter();
  const [soundOn, setSoundOn] = useState(() => {
    if (typeof window !== "undefined") {
      return soundIsOn();
    }
    return true;
  });

  const onPayload = useCallback(
    (_sub: unknown, payload: RealtimeEventPayload) => {
      if (payload.eventType === "INSERT") {
        const order = payload.new as { order_number?: number; total?: number };
        if (soundIsOn()) playBeep();
        toast.info(
          `🔔 NUEVO PEDIDO #${String(order.order_number ?? "?").padStart(3, "0")} — ${formatSoles(Number(order.total ?? 0))}`,
        );
      }
      router.refresh();
    },
    [router],
  );

  useRealtime("admin-pedidos", [{ table: "orders" }], onPayload, () => router.refresh());

  const toggleSound = () => {
    setSoundOn((prev) => {
      const next = !prev;
      localStorage.setItem(SOUND_KEY, next ? "on" : "off");
      if (next) playBeep();
      return next;
    });
  };

  return (
    <button
      onClick={toggleSound}
      aria-pressed={soundOn}
      title={soundOn ? "Desactivar sonido de pedidos nuevos" : "Activar sonido de pedidos nuevos"}
      className="rounded-full p-2 text-muted-foreground hover:bg-muted"
    >
      {soundOn ? (
        <Volume2 className="size-4" aria-hidden />
      ) : (
        <VolumeX className="size-4" aria-hidden />
      )}
    </button>
  );
}
