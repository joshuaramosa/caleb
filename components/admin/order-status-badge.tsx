import { Badge } from "@/components/ui/badge";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case "NUEVO":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-400">
          <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
          Nuevo
        </span>
      );
    case "CONFIRMADO":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
          Confirmado
        </span>
      );
    case "EN_PREPARACION":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
          En preparación
        </span>
      );
    case "LISTO":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
          Listo
        </span>
      );
    case "ASIGNADO":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
          Asignado
        </span>
      );
    case "EN_CAMINO":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400">
          En camino
        </span>
      );
    case "ENTREGADO":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          Entregado
        </span>
      );
    case "CANCELADO":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-500 line-through dark:bg-zinc-800 dark:text-zinc-500">
          Cancelado
        </span>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function PaymentStatusBadge({
  method,
  status,
}: {
  method: PaymentMethod;
  status: PaymentStatus;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 text-xs">
      <span
        className={`font-semibold ${
          method === "YAPE" ? "text-purple-600 dark:text-purple-400" : "text-emerald-600 dark:text-emerald-400"
        }`}
      >
        {method === "YAPE" ? "Yape" : "Contra entrega"}
      </span>
      {status === "VERIFICADO" && (
        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
          ✓ Verificado
        </span>
      )}
      {status === "PENDIENTE" && (
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
          Pendiente
        </span>
      )}
      {status === "RECHAZADO" && (
        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-950/60 dark:text-red-300">
          ✕ Rechazado
        </span>
      )}
    </div>
  );
}
