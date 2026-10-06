"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatSoles } from "@/lib/business";
import { cancelOrderByClient } from "@/app/pedido/[token]/actions";
import type { OrderStatus } from "@/types";

/** Estados en los que cancelar NO tiene recargo (aún no entró a cocina). */
const SIN_RECARGO: OrderStatus[] = ["NUEVO", "CONFIRMADO"];

/** Estados en los que YA no se puede cancelar. */
const NO_CANCELABLE: OrderStatus[] = ["ENTREGADO", "CANCELADO"];

export function CancelOrderButton({
  token,
  status,
  orderNumber,
}: {
  token: string;
  status: OrderStatus;
  orderNumber: number;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (NO_CANCELABLE.includes(status)) return null;

  const gratis = SIN_RECARGO.includes(status);

  const onConfirm = async () => {
    setBusy(true);
    const res = await cancelOrderByClient(token);
    setBusy(false);
    setConfirming(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    if (res.penalized) {
      toast.warning(
        `Pedido cancelado. Tu número quedó suspendido: para reactivarlo deberás cubrir ${formatSoles(res.debt)} (pedido + S/5). Contáctanos por WhatsApp.`,
        { duration: 10000 },
      );
    } else {
      toast.success("Pedido cancelado sin recargo.");
    }
    router.refresh();
  };

  return (
    <section className="flex flex-col gap-2">
      {!confirming ? (
        <Button
          variant="outline"
          onClick={() => setConfirming(true)}
          className="w-full border-red-200 font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          ⛔ Cancelar pedido
        </Button>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm">
          {gratis ? (
            <p>
              Puedes cancelar el pedido <strong>#{String(orderNumber).padStart(3, "0")}</strong>{" "}
              <strong>sin ningún recargo</strong> porque aún no está en preparación.
              ¿Confirmas?
            </p>
          ) : (
            <p>
              ⚠️ Tu pedido <strong>#{String(orderNumber).padStart(3, "0")}</strong> ya está en
              preparación. Si cancelas ahora, <strong>tu número quedará suspendido</strong> y
              deberás <strong>hacerte cargo de los gastos generados</strong> para reactivarlo
              (pedido + S/5 de reactivación). ¿Confirmas la cancelación?
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setConfirming(false)} disabled={busy}>
              Volver
            </Button>
            <Button
              onClick={onConfirm}
              disabled={busy}
              className="bg-red-600 font-bold text-white hover:bg-red-700"
            >
              {busy ? "Cancelando…" : "Sí, cancelar"}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
