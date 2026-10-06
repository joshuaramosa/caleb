"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { unblockCustomer } from "@/app/admin/(panel)/clientes/actions";
import { formatSoles } from "@/lib/business";
import type { Customer, OrderWithDetails } from "@/types";
import {
  Search,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  User,
  Lock,
  LockOpen,
} from "lucide-react";

interface CustomerWithOrders extends Customer {
  orders: OrderWithDetails[];
}

interface CustomersViewProps {
  customers: CustomerWithOrders[];
}

export function CustomersView({ customers }: CustomersViewProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  const handleUnblock = async (customer: CustomerWithOrders) => {
    setUnblocking(customer.id);
    const res = await unblockCustomer(customer.id);
    setUnblocking(null);
    if (res.error) toast.error(res.error);
    else {
      toast.success(`${customer.full_name} reactivado`);
      router.refresh();
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.full_name.toLowerCase().includes(term) ||
        c.phone.includes(term)
    );
  }, [customers, searchTerm]);

  const toggleExpand = (id: string) => {
    setExpandedCustomerId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3">
      {/* Barra de Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por celular o nombre de cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-11 bg-background text-sm rounded-xl"
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card/60 p-8 text-center text-muted-foreground">
          <User className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="font-medium text-sm">No se encontraron clientes</p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Los clientes se registran automáticamente con cada pedido.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredCustomers.map((customer) => {
            const isExpanded = expandedCustomerId === customer.id;
            const orders = customer.orders || [];
            const nonCancelled = orders.filter((o) => o.status !== "CANCELADO");
            const totalSpent = nonCancelled.reduce((sum, o) => sum + Number(o.total || 0), 0);
            const whatsappUrl = `https://wa.me/51${customer.phone}?text=${encodeURIComponent(
               `Hola ${customer.full_name}, te saludamos de Pollería Don Caleb.`
            )}`;

            return (
              <div
                key={customer.id}
                className="rounded-2xl border bg-card p-3.5 shadow-xs transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">
                      {customer.full_name}
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </p>
                    {customer.is_blocked && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                        <Lock className="h-3 w-3" />
                        Suspendido — debe {formatSoles(Number(customer.blocked_debt || 0))}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-1.5">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-8 px-2.5 text-xs gap-1"
                    >
                      <a href={`tel:${customer.phone}`}>
                        <Phone className="h-3 w-3 text-blue-600" />
                        Llamar
                      </a>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-8 px-2.5 text-xs gap-1 text-emerald-600"
                    >
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-3 w-3" />
                        WhatsApp
                      </a>
                    </Button>
                    {customer.is_blocked && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnblock(customer)}
                        disabled={unblocking === customer.id}
                        className="h-8 px-2.5 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50"
                        title={customer.blocked_reason ?? "Reactivar número suspendido"}
                      >
                        <LockOpen className="h-3 w-3" />
                        {unblocking === customer.id ? "…" : "Reactivar"}
                      </Button>
                    )}
                  </div>
                </div>

                {customer.is_blocked && customer.blocked_reason && (
                  <p className="mt-2 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] text-red-700">
                    ⛔ {customer.blocked_reason}. Reactivar solo cuando pague los{" "}
                    <strong>{formatSoles(Number(customer.blocked_debt || 0))}</strong> por WhatsApp.
                  </p>
                )}

                {/* Resumen de actividad */}
                <div className="mt-3 pt-2.5 border-t flex items-center justify-between text-xs">
                  <div className="flex gap-3 text-muted-foreground">
                    <span>
                      Pedidos: <strong className="text-foreground">{orders.length}</strong>
                    </span>
                    <span>
                      Total: <strong className="text-primary">{formatSoles(totalSpent)}</strong>
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleExpand(customer.id)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                  >
                    <span>Historial</span>
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>

                {/* Historial desplegable de pedidos */}
                {isExpanded && (
                  <div className="mt-3 pt-2.5 border-t space-y-2 text-xs">
                    <h4 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                      Historial de Pedidos ({orders.length})
                    </h4>

                    {orders.length === 0 ? (
                      <p className="text-muted-foreground italic">Sin pedidos registrados.</p>
                    ) : (
                      <div className="space-y-2">
                        {orders.map((o) => (
                          <div
                            key={o.id}
                            className="rounded-xl border bg-muted/20 p-2.5 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-foreground">
                                Pedido #{o.order_number}
                              </span>
                              <OrderStatusBadge status={o.status} />
                            </div>
                            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                              <span>
                                {new Date(o.created_at).toLocaleDateString("es-PE", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="font-semibold text-foreground">
                                {formatSoles(o.total)}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {o.items?.map((it) => `${it.quantity}x ${it.product_name}`).join(", ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
