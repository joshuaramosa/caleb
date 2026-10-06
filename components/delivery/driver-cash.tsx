"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Wallet, History, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatSoles } from "@/lib/business";
import { createMySettlement, type CashSummary } from "@/app/delivery/actions";

export type TodayDelivery = {
  delivered_at: string | null;
  orders: {
    order_number: number;
    total: number;
    payment_method: string;
    customer: { full_name: string } | null;
  } | { order_number: number; total: number; payment_method: string; customer: { full_name: string } | null }[] | null;
};

function orderOf(d: TodayDelivery) {
  const o = d.orders;
  return Array.isArray(o) ? o[0] : o;
}

/** Mi caja (efectivo pendiente de rendir) + historial de mis entregas del día. */
export function DriverCash({
  cash,
  today,
}: {
  cash: CashSummary | null;
  today: TodayDelivery[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const pending = cash?.pending_amount ?? 0;
  const pendingOrders = cash?.pending_orders ?? [];
  const settlements = cash?.my_settlements ?? [];
  const pendingSettlement = settlements.find((s) => s.status === "PENDIENTE");

  const onSettle = async () => {
    setBusy(true);
    const res = await createMySettlement();
    setBusy(false);
    if ("error" in res) toast.error(res.error);
    else {
      toast.success(`💵 Rendición enviada: ${formatSoles(res.amount)}. El admin confirmará la recepción.`);
      router.refresh();
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-3 p-4 pt-0 pb-8">
      {/* Caja: efectivo pendiente de entregar al admin */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <Wallet className="size-4 text-[#F0A000]" aria-hidden /> Mi caja
            </h2>
            <span className="text-xl font-black text-foreground">{formatSoles(pending)}</span>
          </div>

          {pending > 0 ? (
            <>
              <p className="text-xs text-muted-foreground">
                Efectivo que llevas de pedidos pagar al recibir entregados hoy:
              </p>
              <ul className="divide-y divide-border/60 text-sm">
                {pendingOrders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between py-1.5">
                    <span>#{String(o.order_number).padStart(3, "0")}</span>
                    <span className="font-semibold">{formatSoles(o.total)}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                onClick={onSettle}
                disabled={busy}
                className="h-12 bg-emerald-600 font-bold text-white hover:bg-emerald-700"
              >
                <HandCoins className="mr-2 size-5" aria-hidden />
                {busy ? "Enviando…" : `ENTREGAR ${formatSoles(pending)} AL LOCAL`}
              </Button>
            </>
          ) : pendingSettlement ? (
            <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700">
              ⏳ Rendición de {formatSoles(pendingSettlement.amount)} pendiente: el admin debe
              confirmar que recibió el dinero.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Sin efectivo pendiente. 🎉</p>
          )}
        </CardContent>
      </Card>

      {/* Historial del día */}
      <Card>
        <CardContent className="flex flex-col gap-2 p-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <History className="size-4 text-[#F0A000]" aria-hidden /> Mis entregas de hoy ({today.length})
          </h2>
          {today.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no completas entregas hoy.</p>
          ) : (
            <ul className="divide-y divide-border/60 text-sm">
              {today.map((d, i) => {
                const o = orderOf(d);
                return (
                  <li key={i} className="flex items-center justify-between py-1.5">
                    <span>
                      #{String(o?.order_number ?? 0).padStart(3, "0")}{" "}
                      <span className="text-muted-foreground">{o?.customer?.full_name}</span>
                    </span>
                    <span className={o?.payment_method === "CONTRA_ENTREGA" ? "font-semibold text-emerald-700" : "font-semibold"}>
                      {formatSoles(Number(o?.total ?? 0))}
                      {o?.payment_method === "CONTRA_ENTREGA" ? " 💵" : " 💜"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
