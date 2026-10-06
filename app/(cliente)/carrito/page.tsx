import { createClient } from "@/lib/supabase/server";
import { CartView } from "@/components/carrito/cart-view";
import { CalebLogo } from "@/components/ui/caleb-logo";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import type { BusinessSettings } from "@/types";

export const metadata = { title: "Tu pedido — Pollería Don Caleb" };
export const dynamic = "force-dynamic";

export default async function CarritoPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("business_settings").select("*").single();

  const config = settings as BusinessSettings | null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/carta"
            className="p-1.5 -ml-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
            aria-label="Volver a la carta"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <CalebLogo size="xs" asLink href="/" />
        </div>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <ShoppingBag className="size-4 text-caleb-600" />
          <span>Tu Carrito</span>
        </div>
      </header>
      <CartView deliveryFee={Number(config?.delivery_fee ?? 0)} />
    </div>
  );
}
