"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { formatSoles, isTodayInLima, limaMonthKey } from "@/lib/business";
import type { OrderWithDetails } from "@/types";
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Banknote,
  Award,
} from "lucide-react";

interface SalesViewProps {
  orders: OrderWithDetails[];
}

export function SalesView({ orders }: SalesViewProps) {
  const [period, setPeriod] = useState<"TODAY" | "7DAYS" | "MONTH" | "ALL">("TODAY");

  const filteredOrders = useMemo(() => {
    const now = new Date();
    // Las comparaciones de fecha usan el calendario de Perú (America/Lima),
    // no la zona horaria del dispositivo.
    return orders.filter((o) => {
      if (period === "TODAY") return isTodayInLima(o.created_at);
      if (period === "7DAYS") {
        const diffDays = (now.getTime() - new Date(o.created_at).getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      if (period === "MONTH") return limaMonthKey(o.created_at) === limaMonthKey(new Date());
      return true;
    });
  }, [orders, period]);

  // Excluir cancelados para métricas de dinero
  const validOrders = useMemo(
    () => filteredOrders.filter((o) => o.status !== "CANCELADO"),
    [filteredOrders]
  );

  const totalSales = useMemo(
    () => validOrders.reduce((acc, o) => acc + Number(o.total || 0), 0),
    [validOrders]
  );

  const avgTicket = useMemo(
    () => (validOrders.length > 0 ? totalSales / validOrders.length : 0),
    [validOrders, totalSales]
  );

  // Distribución de métodos de pago
  const paymentStats = useMemo(() => {
    let yapeTotal = 0;
    let yapeCount = 0;
    let cashTotal = 0;
    let cashCount = 0;

    validOrders.forEach((o) => {
      const amount = Number(o.total || 0);
      if (o.payment_method === "YAPE") {
        yapeTotal += amount;
        yapeCount += 1;
      } else {
        cashTotal += amount;
        cashCount += 1;
      }
    });

    const total = yapeTotal + cashTotal || 1;
    const yapePct = Math.round((yapeTotal / total) * 100);
    const cashPct = Math.round((cashTotal / total) * 100);

    return { yapeTotal, yapeCount, cashTotal, cashCount, yapePct, cashPct };
  }, [validOrders]);

  // Ranking de productos más vendidos
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();

    validOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const key = item.product_name;
        const current = map.get(key) || { name: key, qty: 0, revenue: 0 };
        current.qty += item.quantity;
        current.revenue += Number(item.line_total || 0);
        map.set(key, current);
      });
    });

    const list = Array.from(map.values()).sort((a, b) => b.qty - a.qty);
    const maxQty = list.length > 0 ? list[0].qty : 1;
    return { list, maxQty };
  }, [validOrders]);

  return (
    <div className="space-y-4">
      {/* Filtro de Periodo */}
      <div className="flex rounded-xl bg-card border p-1 shadow-xs text-xs font-semibold">
        <button
          onClick={() => setPeriod("TODAY")}
          className={`flex-1 py-2 rounded-lg transition-all ${
            period === "TODAY"
              ? "bg-primary text-primary-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Hoy
        </button>
        <button
          onClick={() => setPeriod("7DAYS")}
          className={`flex-1 py-2 rounded-lg transition-all ${
            period === "7DAYS"
              ? "bg-primary text-primary-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          7 Días
        </button>
        <button
          onClick={() => setPeriod("MONTH")}
          className={`flex-1 py-2 rounded-lg transition-all ${
            period === "MONTH"
              ? "bg-primary text-primary-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Este Mes
        </button>
        <button
          onClick={() => setPeriod("ALL")}
          className={`flex-1 py-2 rounded-lg transition-all ${
            period === "ALL"
              ? "bg-primary text-primary-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Histórico
        </button>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-2 gap-2.5">
        <Card className="rounded-2xl border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Ventas Totales</span>
            <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-black text-foreground">
            {formatSoles(totalSales)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {validOrders.length} pedidos efectivos
          </p>
        </Card>

        <Card className="rounded-2xl border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Ticket Promedio</span>
            <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-black text-foreground">
            {formatSoles(avgTicket)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Por cada pedido despachado
          </p>
        </Card>
      </div>

      {/* Distribución por Método de Pago */}
      <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Distribución de Pagos
        </h3>

        {/* Barra de proporción visual */}
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
          <div
            style={{ width: `${paymentStats.yapePct}%` }}
            className="bg-purple-600 transition-all duration-500"
          />
          <div
            style={{ width: `${paymentStats.cashPct}%` }}
            className="bg-emerald-600 transition-all duration-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
          <div className="rounded-xl border border-purple-200/50 bg-purple-50/40 dark:bg-purple-950/20 p-2.5">
            <div className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-400">
              <CreditCard className="h-4 w-4" />
              <span>Yape ({paymentStats.yapePct}%)</span>
            </div>
            <p className="text-base font-extrabold text-foreground mt-1">
              {formatSoles(paymentStats.yapeTotal)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {paymentStats.yapeCount} transacciones
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-2.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
              <Banknote className="h-4 w-4" />
              <span>Contra entrega ({paymentStats.cashPct}%)</span>
            </div>
            <p className="text-base font-extrabold text-foreground mt-1">
              {formatSoles(paymentStats.cashTotal)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {paymentStats.cashCount} transacciones
            </p>
          </div>
        </div>
      </div>

      {/* Ranking de Productos Más Vendidos */}
      <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Award className="h-4 w-4 text-primary" />
            Productos Más Vendidos
          </h3>
          <span className="text-[11px] text-muted-foreground">
            {topProducts.list.length} variedades
          </span>
        </div>

        {topProducts.list.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-4 italic">
            Sin ventas en este periodo seleccionado.
          </p>
        ) : (
          <div className="space-y-2.5 pt-1">
            {topProducts.list.slice(0, 8).map((item, idx) => {
              const widthPct = Math.round((item.qty / topProducts.maxQty) * 100);

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground truncate max-w-[65%]">
                      <strong className="text-primary mr-1">#{idx + 1}</strong>
                      {item.name}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      <strong className="text-foreground">{item.qty} unids</strong> • {formatSoles(item.revenue)}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className="h-full rounded-full bg-primary transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
