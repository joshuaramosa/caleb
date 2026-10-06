import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatSoles } from "@/lib/business";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderTracker } from "@/components/pedido/order-tracker";
import { LiveDeliveryCard } from "@/components/pedido/live-delivery-card";
import { CancelOrderButton } from "@/components/pedido/cancel-order-button";
import type { OrderStatus } from "@/types";

export const metadata = { title: "Estado de tu pedido — CALEB" };
export const dynamic = "force-dynamic";

export default async function PedidoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, customers(full_name), order_items(product_name, unit_price, quantity, line_total), payments(method, status)")
    .eq("tracking_token", token)
    .single();

  if (!order) notFound();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 p-4">
      <header className="text-center">
        <p className="text-3xl" aria-hidden>🍗</p>
        <h1 className="text-2xl font-bold">
          Pedido #{String(order.order_number).padStart(3, "0")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date(order.created_at).toLocaleString("es-PE", { timeZone: "America/Lima" })}
        </p>
      </header>

      <OrderTracker orderId={order.id} initialStatus={order.status as OrderStatus} />

      {/* Mapa en vivo del motorizado mientras EN_CAMINO */}
      <LiveDeliveryCard token={token} />

      <Card>
        <CardContent className="flex flex-col gap-2 p-4 text-sm">
          {order.order_items.map(
            (item: { product_name: string; quantity: number; line_total: number }, i: number) => (
              <div key={i} className="flex justify-between">
                <span>{item.quantity} × {item.product_name}</span>
                <span>{formatSoles(Number(item.line_total))}</span>
              </div>
            ),
          )}
          <div className="flex justify-between border-t pt-2 text-muted-foreground">
            <span>Delivery</span>
            <span>{formatSoles(Number(order.delivery_fee))}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span className="text-caleb-600">{formatSoles(Number(order.total))}</span>
          </div>
          <p className="border-t pt-2 text-muted-foreground">
            Pago: {order.payments?.[0]?.method === "YAPE" ? "Yape" : "Al recibir"} ·{" "}
            {order.payments?.[0]?.status}
          </p>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Guarda este enlace para seguir tu pedido en vivo: caleb.pe/pedido/{token}
      </p>

      <CancelOrderButton
        token={token}
        status={order.status as OrderStatus}
        orderNumber={order.order_number}
      />

      <Button asChild variant="outline">
        <Link href="/carta">Volver a la carta</Link>
      </Button>
    </main>
  );
}
