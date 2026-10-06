import { createClient } from "@/lib/supabase/server";
import { isOpenNow } from "@/lib/business";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { Button } from "@/components/ui/button";
import { CalebLogo } from "@/components/ui/caleb-logo";
import Link from "next/link";
import type { BusinessSettings } from "@/types";

export const metadata = { title: "Completar pedido — Pollería Don Caleb" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("business_settings").select("*").single();
  const config = settings as BusinessSettings | null;

  if (!config || !isOpenNow(config)) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center bg-gradient-to-b from-amber-500/5 to-background">
        <CalebLogo size="md" glow asLink href="/" />
        <h1 className="text-xl font-bold mt-2">Pollería Don Caleb está cerrado ahora</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Atendemos de {config?.open_time.slice(0, 5)} a {config?.close_time.slice(0, 5)} hs.
          Vuelve en nuestro horario para completar tu pedido.
        </p>
        <Button asChild className="bg-caleb-600 hover:bg-caleb-700 text-white mt-2">
          <Link href="/carta">Ver la carta digital</Link>
        </Button>
      </main>
    );
  }

  return <CheckoutFlow settings={config} />;
}
