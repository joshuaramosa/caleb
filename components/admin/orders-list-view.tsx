"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/order-status-badge";
import { OrderDetailDialog } from "@/components/admin/order-detail-dialog";
import { formatSoles } from "@/lib/business";
import type { OrderWithDetails, StaffUser } from "@/types";
import {
  Search,
  RefreshCw,
  ChefHat,
  Bike,
  Clock,
  ChevronRight,
  Filter,
} from "lucide-react";
import { updateOrderStatus } from "@/app/admin/(panel)/pedidos/actions";
import { useRouter } from "next/navigation";

interface OrdersListViewProps {
  initialOrders: OrderWithDetails[];
  repartidores: StaffUser[];
}

export function OrdersListView({
  initialOrders,
  repartidores,
}: OrdersListViewProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithDetails[]>(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeOrder, setActiveOrder] = useState<OrderWithDetails | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Sincronizar si cambia initialOrders desde SSR (patrón "adjust during render")
  const [prevInitialOrders, setPrevInitialOrders] = useState(initialOrders);
  if (prevInitialOrders !== initialOrders) {
    setPrevInitialOrders(initialOrders);
    setOrders(initialOrders);
  }

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Filtro por tab/estado
      if (selectedStatus === "NUEVOS" && order.status !== "NUEVO") return false;
      if (
        selectedStatus === "COCINA" &&
        order.status !== "CONFIRMADO" &&
        order.status !== "EN_PREPARACION"
      )
        return false;
      if (selectedStatus === "LISTOS" && order.status !== "LISTO") return false;
      if (
        selectedStatus === "EN_RUTA" &&
        order.status !== "ASIGNADO" &&
        order.status !== "EN_CAMINO"
      )
        return false;
      if (selectedStatus === "ENTREGADOS" && order.status !== "ENTREGADO")
        return false;

      // Filtro por texto de búsqueda
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const numMatch = order.order_number.toString().includes(term);
      const nameMatch = order.customer?.full_name?.toLowerCase().includes(term);
      const phoneMatch = order.customer?.phone?.includes(term);
      const refMatch = order.address?.reference?.toLowerCase().includes(term);
      return numMatch || nameMatch || phoneMatch || refMatch;
    });
  }, [orders, selectedStatus, searchTerm]);

  // Contadores para las pestañas
  const counts = useMemo(() => {
    const nuev = orders.filter((o) => o.status === "NUEVO").length;
    const coc = orders.filter(
      (o) => o.status === "CONFIRMADO" || o.status === "EN_PREPARACION"
    ).length;
    const lis = orders.filter((o) => o.status === "LISTO").length;
    const rut = orders.filter(
      (o) => o.status === "ASIGNADO" || o.status === "EN_CAMINO"
    ).length;
    return { nuev, coc, lis, rut, all: orders.length };
  }, [orders]);

  const handleQuickConfirm = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setActionLoading(orderId);
    await updateOrderStatus(orderId, "CONFIRMADO");
    setActionLoading(null);
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {/* Barra de Búsqueda y Actualizar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por #pedido, cliente o celular..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 bg-background text-sm rounded-xl"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-11 w-11 rounded-xl shrink-0"
          title="Actualizar lista"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin text-primary" : ""}`}
          />
        </Button>
      </div>

      {/* Selector de Pestañas tipo Pill (Scroll horizontal en móvil) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
        <button
          onClick={() => setSelectedStatus("ALL")}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors touch-manipulation ${
            selectedStatus === "ALL"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-background border text-muted-foreground hover:text-foreground"
          }`}
        >
          Todos ({counts.all})
        </button>
        <button
          onClick={() => setSelectedStatus("NUEVOS")}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors touch-manipulation flex items-center gap-1.5 ${
            selectedStatus === "NUEVOS"
              ? "bg-red-600 text-white shadow-xs"
              : "bg-background border text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          Nuevos ({counts.nuev})
        </button>
        <button
          onClick={() => setSelectedStatus("COCINA")}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors touch-manipulation flex items-center gap-1.5 ${
            selectedStatus === "COCINA"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-background border text-muted-foreground hover:text-foreground"
          }`}
        >
          <ChefHat className="h-3.5 w-3.5" />
          Cocina ({counts.coc})
        </button>
        <button
          onClick={() => setSelectedStatus("LISTOS")}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors touch-manipulation flex items-center gap-1.5 ${
            selectedStatus === "LISTOS"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-background border text-muted-foreground hover:text-foreground"
          }`}
        >
          Listos ({counts.lis})
        </button>
        <button
          onClick={() => setSelectedStatus("EN_RUTA")}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors touch-manipulation flex items-center gap-1.5 ${
            selectedStatus === "EN_RUTA"
              ? "bg-cyan-600 text-white shadow-xs"
              : "bg-background border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bike className="h-3.5 w-3.5" />
          En ruta ({counts.rut})
        </button>
        <button
          onClick={() => setSelectedStatus("ENTREGADOS")}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors touch-manipulation ${
            selectedStatus === "ENTREGADOS"
              ? "bg-zinc-800 text-white shadow-xs"
              : "bg-background border text-muted-foreground hover:text-foreground"
          }`}
        >
          Entregados
        </button>
      </div>

      {/* Lista de Tarjetas de Pedido */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card/60 p-8 text-center text-muted-foreground">
          <Filter className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="font-medium text-sm">No hay pedidos en esta sección</p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Los pedidos aparecerán aquí según su estado.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 xl:grid-cols-3">
          {filteredOrders.map((order) => {
            const timeStr = new Date(order.created_at).toLocaleTimeString("es-PE", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const isNuevo = order.status === "NUEVO";

            return (
              <div
                key={order.id}
                onClick={() => setActiveOrder(order)}
                className={`group relative rounded-2xl border bg-card p-3.5 shadow-xs transition-all hover:shadow-md cursor-pointer active:scale-[0.99] touch-manipulation ${
                  isNuevo ? "border-red-500/50 bg-red-500/5 ring-1 ring-red-500/20" : ""
                }`}
              >
                {/* Cabecera de la tarjeta */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-foreground tracking-tight">
                        #{order.order_number}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {order.customer?.full_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-primary">
                      {formatSoles(order.total)}
                    </span>
                    <div className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>{timeStr}</span>
                    </div>
                  </div>
                </div>

                {/* Resumen de productos */}
                <div className="mt-2 text-xs text-muted-foreground line-clamp-1">
                  {order.items?.map((it) => `${it.quantity}x ${it.product_name}`).join(", ")}
                </div>

                {/* Pie de tarjeta con método de pago y acciones rápidas */}
                <div className="mt-2.5 pt-2 border-t flex items-center justify-between gap-2">
                  <PaymentStatusBadge
                    method={order.payment_method}
                    status={order.payment?.status || "PENDIENTE"}
                  />

                  <div className="flex items-center gap-1.5">
                    {isNuevo && (
                      <Button
                        size="sm"
                        onClick={(e) => handleQuickConfirm(e, order.id)}
                        disabled={actionLoading === order.id}
                        className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
                      >
                        Confirmar
                      </Button>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Diálogo con detalle completo */}
      <OrderDetailDialog
        order={activeOrder}
        isOpen={!!activeOrder}
        onClose={() => setActiveOrder(null)}
        repartidores={repartidores}
        onOrderUpdated={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
