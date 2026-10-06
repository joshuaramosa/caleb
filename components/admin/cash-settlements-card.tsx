"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Wallet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatSoles } from "@/lib/business";
import { confirmSettlement, type Settlement } from "@/app/admin/(panel)/pedidos/actions";

/** Rendiciones de efectivo de repartidores: admin confirma que recibió el dinero. */
export function CashSettlementsCard({ settlements }: { settlements: Settlement[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const pending = settlements.filter((s) => s.status === "PENDIENTE");
  if (pending.length === 0) return null;

  const onConfirm = async (s: Settlement) => {
    setBusy(s.id);
    const res = await confirmSettlement(s.id);
    setBusy(null);
    if (res.error) toast.error(res.error);
    else {
      toast.success(`✅ Recibiste ${formatSoles(s.amount)} de ${s.driver_name}`);
      router.refresh();
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-3">
      <h2 className="flex items-center gap-2 font-semibold">
        <Wallet className="size-4 text-[#F0A000]" aria-hidden /> Efectivo por recibir ({pending.length})
      </h2>
      <ul className="space-y-2">
        {pending.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-2 rounded-xl bg-muted/40 p-3 text-sm">
            <div>
              <p className="font-bold">
                🛵 {s.driver_name} — {formatSoles(s.amount)}
              </p>
              <p className="text-xs text-muted-foreground">
                {s.orders.map((o) => `#${String(o.order_number).padStart(3, "0")} (${formatSoles(o.total)})`).join(", ")}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => onConfirm(s)}
              disabled={busy === s.id}
              className="h-9 gap-1 bg-emerald-600 font-bold text-white hover:bg-emerald-700"
            >
              <CheckCircle2 className="size-4" aria-hidden />
              {busy === s.id ? "…" : "Recibí"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
