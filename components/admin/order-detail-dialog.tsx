"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/order-status-badge";
import { formatSoles } from "@/lib/business";
import type { OrderWithDetails, StaffUser, OrderStatus, PaymentStatus } from "@/types";
import {
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  XCircle,
  ChefHat,
  Bike,
  ExternalLink,
  Eye,
  Loader2,
} from "lucide-react";

// Mini-mapa in-app (Leaflet/OSM), sin Google Maps
const RouteMap = dynamic(() => import("@/components/mapa/route-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-56 w-full items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
      Cargando mapa…
    </div>
  ),
});
import {
  updateOrderStatus,
  verifyPaymentProof,
  assignDelivery,
  getPaymentProofUrl,
} from "@/app/admin/(panel)/pedidos/actions";

interface OrderDetailDialogProps {
  order: OrderWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  repartidores: StaffUser[];
  onOrderUpdated?: () => void;
}

export function OrderDetailDialog({
  order,
  isOpen,
  onClose,
  repartidores,
  onOrderUpdated,
}: OrderDetailDialogProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [selectedRepartidor, setSelectedRepartidor] = useState<string>(
    order?.delivery_assignment?.delivery_user_id || ""
  );
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [loadingProof, setLoadingProof] = useState(false);

  if (!order) return null;

  const customerPhone = order.customer?.phone || "";
  const whatsappUrl = `https://wa.me/51${customerPhone}?text=${encodeURIComponent(
    `Hola ${order.customer?.full_name}, te escribimos de Pollería Don Caleb respecto a tu pedido #${order.order_number}.`
  )}`;

  const hasCoords = order.address?.lat != null && order.address?.lng != null;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setLoadingAction(newStatus);
    const res = await updateOrderStatus(order.id, newStatus);
    setLoadingAction(null);
    if (!res.error) {
      if (onOrderUpdated) onOrderUpdated();
      onClose();
    }
  };

  const handleVerifyPayment = async (status: PaymentStatus) => {
    setLoadingAction(`payment-${status}`);
    const res = await verifyPaymentProof(order.id, status);
    setLoadingAction(null);
    if (!res.error) {
      if (onOrderUpdated) onOrderUpdated();
    }
  };

  const handleAssignDelivery = async () => {
    if (!selectedRepartidor) return;
    setLoadingAction("assign");
    const res = await assignDelivery(order.id, selectedRepartidor);
    setLoadingAction(null);
    if (!res.error) {
      if (onOrderUpdated) onOrderUpdated();
      onClose();
    }
  };

  const handleViewProof = async () => {
    if (!order.payment?.proof_url) return;
    setLoadingProof(true);
    const res = await getPaymentProofUrl(order.payment.proof_url);
    setLoadingProof(false);
    if ("url" in res && res.url) {
      setProofPreviewUrl(res.url);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg p-5">
          <DialogHeader className="border-b pb-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xl font-black tracking-tight text-primary">
                Pedido #{order.order_number}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              Registrado: {new Date(order.created_at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })} • ID: {order.tracking_token}
            </p>
          </DialogHeader>

          {/* Cliente y Contacto */}
          <div className="space-y-3 pt-2 text-sm">
            <div className="rounded-xl bg-card border p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{order.customer?.full_name}</h4>
                  <p className="text-xs text-muted-foreground">{customerPhone}</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline" className="h-9 px-3 gap-1 text-xs">
                    <a href={`tel:${customerPhone}`}>
                      <Phone className="h-3.5 w-3.5 text-blue-600" />
                      Llamar
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="h-9 px-3 gap-1 text-xs text-emerald-600 hover:text-emerald-700">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Repartidor asignado (visible siempre que exista, incl. entregados) */}
            {order.delivery_assignment?.delivery_user && (
              <div className="flex items-center gap-2.5 rounded-xl border bg-card p-3 shadow-xs text-sm">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#F0A000] text-sm font-black text-white">
                  {order.delivery_assignment.delivery_user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    🛵 {order.delivery_assignment.delivery_user.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.delivery_assignment.status === "ENTREGADO" && order.delivery_assignment.delivered_at
                      ? `Entregado ${new Date(order.delivery_assignment.delivered_at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", timeZone: "America/Lima" })}`
                      : order.delivery_assignment.status === "EN_CAMINO"
                        ? "En camino"
                        : "Asignado"}
                  </p>
                </div>
                {order.delivery_assignment.delivery_user.phone && (
                  <a
                    href={`https://wa.me/51${order.delivery_assignment.delivery_user.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-600 underline"
                  >
                    💬 WhatsApp
                  </a>
                )}
              </div>
            )}

            {/* Dirección y Navegación */}
            <div className="rounded-xl bg-card border p-3 shadow-xs space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{order.address?.address}</p>
                  {order.address?.reference && (
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      Ref: <span className="text-foreground">{order.address.reference}</span>
                    </p>
                  )}
                </div>
              </div>

              {hasCoords ? (
                <RouteMap
                  destLat={order.address!.lat}
                  destLng={order.address!.lng}
                  heightClass="h-56"
                />
              ) : (
                <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-[11px] font-medium text-amber-700">
                  📍 El cliente no compartió GPS. Guíate con la referencia escrita.
                </p>
              )}
            </div>

            {/* Ítems del pedido */}
            <div className="rounded-xl bg-card border p-3 shadow-xs">
              <h5 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Productos ({order.items?.length || 0})
              </h5>
              <div className="divide-y divide-border/60">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        <span className="font-bold text-primary mr-1.5">{item.quantity}x</span>
                        {item.product_name}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground italic pl-5">
                          Nota: {item.notes}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold">{formatSoles(item.line_total)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t mt-3 pt-2 space-y-1 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatSoles(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span>{formatSoles(order.delivery_fee)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground pt-1 border-t">
                  <span>Total</span>
                  <span className="text-primary">{formatSoles(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Información de Pago y Comprobante Yape */}
            <div className="rounded-xl bg-card border p-3 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-muted-foreground">Pago:</span>
                <PaymentStatusBadge
                  method={order.payment_method}
                  status={order.payment?.status || "PENDIENTE"}
                />
              </div>

              {order.payment_method === "YAPE" && (
                <div className="pt-2 border-t flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Comprobante adjunto:</span>
                    {order.payment?.proof_url ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleViewProof}
                        disabled={loadingProof}
                        className="h-8 gap-1 text-xs"
                      >
                        {loadingProof ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Eye className="h-3.5 w-3.5 text-purple-600" />
                        )}
                        Ver comprobante
                      </Button>
                    ) : (
                      <span className="text-xs text-amber-600 italic">No subió comprobante</span>
                    )}
                  </div>

                  {order.payment?.status === "PENDIENTE" && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => handleVerifyPayment("VERIFICADO")}
                        disabled={loadingAction === "payment-VERIFICADO"}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-xs gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Aprobar Yape
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleVerifyPayment("RECHAZADO")}
                        disabled={loadingAction === "payment-RECHAZADO"}
                        className="flex-1 h-9 text-xs gap-1"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Rechazar Yape
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Asignación de Repartidor */}
            {(order.status === "LISTO" || order.status === "ASIGNADO" || order.status === "EN_CAMINO") && (
              <div className="rounded-xl bg-card border p-3 shadow-xs space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
                  <Bike className="h-4 w-4 text-primary" />
                  <span>Repartidor asignado:</span>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedRepartidor}
                    onChange={(e) => setSelectedRepartidor(e.target.value)}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="">Selecciona un repartidor...</option>
                    {repartidores.map((rep) => (
                      <option key={rep.id} value={rep.id}>
                        {rep.full_name} {rep.phone ? `(${rep.phone})` : ""}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={handleAssignDelivery}
                    disabled={!selectedRepartidor || loadingAction === "assign"}
                    className="h-9 text-xs"
                  >
                    {loadingAction === "assign" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Asignar"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Acciones principales del flujo */}
          <DialogFooter className="mt-3 flex-col sm:flex-col gap-2">
            {order.status === "NUEVO" && (
              <Button
                onClick={() => handleStatusChange("CONFIRMADO")}
                disabled={loadingAction === "CONFIRMADO"}
                className="w-full h-11 bg-primary text-primary-foreground font-bold text-sm gap-2"
              >
                {loadingAction === "CONFIRMADO" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChefHat className="h-4 w-4" />
                )}
                Confirmar pedido (Enviar a cocina)
              </Button>
            )}

            {order.status === "CONFIRMADO" && (
              <Button
                onClick={() => handleStatusChange("EN_PREPARACION")}
                disabled={loadingAction === "EN_PREPARACION"}
                className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm"
              >
                {loadingAction === "EN_PREPARACION" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Poner en preparación
              </Button>
            )}

            {order.status === "EN_PREPARACION" && (
              <Button
                onClick={() => handleStatusChange("LISTO")}
                disabled={loadingAction === "LISTO"}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm"
              >
                {loadingAction === "LISTO" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Marcar como listo
              </Button>
            )}

            {order.status === "ASIGNADO" && (
              <Button
                onClick={() => handleStatusChange("EN_CAMINO")}
                disabled={loadingAction === "EN_CAMINO"}
                className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm"
              >
                {loadingAction === "EN_CAMINO" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Despachar (En camino)
              </Button>
            )}

            {order.status === "EN_CAMINO" && (
              <Button
                onClick={() => handleStatusChange("ENTREGADO")}
                disabled={loadingAction === "ENTREGADO"}
                className="w-full h-11 bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-sm"
              >
                {loadingAction === "ENTREGADO" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Marcar como entregado
              </Button>
            )}

            {order.status !== "ENTREGADO" && order.status !== "CANCELADO" && (
              <Button
                variant="ghost"
                onClick={() => {
                  if (confirm("¿Estás seguro de cancelar este pedido?")) {
                    handleStatusChange("CANCELADO");
                  }
                }}
                disabled={loadingAction === "CANCELADO"}
                className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                Cancelar pedido
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal visor del comprobante de Yape */}
      {proofPreviewUrl && (
        <Dialog open={!!proofPreviewUrl} onOpenChange={() => setProofPreviewUrl(null)}>
          <DialogContent className="max-w-md p-4 text-center">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Comprobante de Yape</DialogTitle>
            </DialogHeader>
            <div className="mt-2 overflow-hidden rounded-lg bg-black/5 flex items-center justify-center min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proofPreviewUrl}
                alt="Comprobante de Yape"
                className="max-h-[70vh] w-auto object-contain rounded"
              />
            </div>
            <div className="mt-3 flex justify-between gap-2">
              <Button
                size="sm"
                variant="outline"
                asChild
                className="flex-1"
              >
                <a href={proofPreviewUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Abrir imagen
                </a>
              </Button>
              <Button size="sm" onClick={() => setProofPreviewUrl(null)} className="flex-1">
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
