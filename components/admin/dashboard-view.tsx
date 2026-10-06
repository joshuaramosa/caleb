"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderDetailDialog } from "@/components/admin/order-detail-dialog";
import { formatSoles } from "@/lib/business";
import type { OrderWithDetails, StaffUser } from "@/types";
import {
  TrendingUp,
  ShoppingBag,
  ChevronRight,
  ChefHat,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { updateOrderStatus } from "@/app/admin/(panel)/pedidos/actions";
import { useRouter } from "next/navigation";

interface DashboardViewProps {
  ordersToday: OrderWithDetails[];
  repartidores: StaffUser[];
  businessIsOpen: boolean;
}

export function DashboardView({
  ordersToday,
  repartidores,
  businessIsOpen,
}: DashboardViewProps) {
  const router = useRouter();
  const [activeOrder, setActiveOrder] = useState<OrderWithDetails | null>(null);
  const [quickLoading, setQuickLoading] = useState<string | null>(null);

  // Métricas del día (excluyendo cancelados para ventas)
  const nonCancelled = ordersToday.filter((o) => o.status !== "CANCELADO");
  const totalSalesToday = nonCancelled.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const totalOrdersCount = ordersToday.length;
  const averageTicket = nonCancelled.length > 0 ? totalSalesToday / nonCancelled.length : 0;

  // Grupos de pedidos del día
  const newOrders = ordersToday.filter((o) => o.status === "NUEVO");
  const prepOrders = ordersToday.filter(
    (o) => o.status === "CONFIRMADO" || o.status === "EN_PREPARACION"
  );
  const readyOrders = ordersToday.filter(
    (o) => o.status === "LISTO" || o.status === "ASIGNADO"
  );

  const handleQuickConfirm = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setQuickLoading(orderId);
    await updateOrderStatus(orderId, "CONFIRMADO");
    setQuickLoading(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Alerta de estado del negocio */}
      <div className="flex items-center justify-between rounded-xl bg-card border p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span
            className={`h-3 w-3 rounded-full ${
              businessIsOpen ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
            }`}
          />
          <div>
            <p className="text-xs font-semibold leading-none">
              Estado: {businessIsOpen ? "Atendiendo pedidos" : "Cerrado"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {businessIsOpen
                ? "Recepción activa en la carta digital"
                : "Los clientes verán el horario de apertura"}
            </p>
          </div>
        </div>
        <Button asChild size="sm" variant="ghost" className="h-8 text-xs gap-1">
          <Link href="/admin/configuracion">
            Ajustes
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Contadores Principales (Grid 2x2 para móvil) */}
      <div className="grid grid-cols-2 gap-2.5">
        <Card className="rounded-2xl border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Ventas Hoy</span>
            <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-black tracking-tight text-foreground">
            {formatSoles(totalSalesToday)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {nonCancelled.length} pedidos pagados/activos
          </p>
        </Card>

        <Card className="rounded-2xl border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pedidos Hoy</span>
            <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-black tracking-tight text-foreground">
            {totalOrdersCount}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Ticket prom: {formatSoles(averageTicket)}
          </p>
        </Card>
      </div>

      {/* Acceso Rápido a Pedidos */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Flujo de Cocina y Despacho
        </h2>
        <Button asChild size="sm" variant="link" className="h-7 p-0 text-xs text-primary gap-1">
          <Link href="/admin/pedidos">
            Ver todos
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* 🔴 NUEVOS PEDIDOS (Prioridad 1) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-600 animate-ping" />
            <h3 className="text-sm font-bold text-red-600 dark:text-red-400">
              🔴 Nuevos por Confirmar ({newOrders.length})
            </h3>
          </div>
        </div>

        {newOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed p-3 text-center text-xs text-muted-foreground">
            No hay pedidos nuevos pendientes de confirmación.
          </div>
        ) : (
          <div className="space-y-2">
            {newOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setActiveOrder(order)}
                className="rounded-xl border border-red-500/40 bg-red-50/50 dark:bg-red-950/20 p-3 shadow-xs cursor-pointer active:scale-[0.99] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-sm font-black text-foreground">
                      #{order.order_number} • {order.customer?.full_name}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.items?.map((it) => `${it.quantity}x ${it.product_name}`).join(", ")}
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-primary">
                    {formatSoles(order.total)}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-red-200/50 dark:border-red-900/40">
                  <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-400">
                    {order.payment_method === "YAPE" ? "📱 Yape" : "💵 Contra entrega"}
                  </span>
                  <Button
                    size="sm"
                    onClick={(e) => handleQuickConfirm(e, order.id)}
                    disabled={quickLoading === order.id}
                    className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
                  >
                    Confirmar ahora
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🟠 EN PREPARACIÓN (Cocina) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <ChefHat className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400">
            🟠 En Preparación ({prepOrders.length})
          </h3>
        </div>

        {prepOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed p-3 text-center text-xs text-muted-foreground">
            Cocina al día. No hay pedidos en cocción.
          </div>
        ) : (
          <div className="space-y-2">
            {prepOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setActiveOrder(order)}
                className="rounded-xl border bg-card p-3 shadow-xs cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm">#{order.order_number}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.customer?.full_name} • {order.items?.length} productos
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-foreground">
                    {formatSoles(order.total)}
                  </span>
                  <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground/50 mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🟢 LISTOS PARA DESPACHO */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
            🟢 Listos para Salida ({readyOrders.length})
          </h3>
        </div>

        {readyOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed p-3 text-center text-xs text-muted-foreground">
            No hay pedidos listos esperando repartidor.
          </div>
        ) : (
          <div className="space-y-2">
            {readyOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setActiveOrder(order)}
                className="rounded-xl border bg-card p-3 shadow-xs cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm">#{order.order_number}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.customer?.full_name} • {order.address?.reference || order.address?.address}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-foreground">
                    {formatSoles(order.total)}
                  </span>
                  <p className="text-[10px] text-primary font-medium mt-0.5">
                    {order.delivery_assignment ? "Repartidor listo" : "Asignar"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo de Detalle */}
      <OrderDetailDialog
        order={activeOrder}
        isOpen={!!activeOrder}
        onClose={() => setActiveOrder(null)}
        repartidores={repartidores}
        onOrderUpdated={() => router.refresh()}
      />
    </div>
  );
}
