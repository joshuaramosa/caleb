import { ChevronRight, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isOpenNow } from "@/lib/business";
import { CalebLogo } from "@/components/ui/caleb-logo";
import { CartHeaderButton } from "@/components/cliente/cart-header-button";
import { HomeCatalog } from "@/components/inicio/home-catalog";
import type { Category, Product, BusinessSettings, Promotion } from "@/types";

export const dynamic = "force-dynamic";

/** "18:30" -> "6:30 p.m." */
function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "p.m." : "a.m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: products }, { data: settings }, { data: promos }] =
    await Promise.all([
      supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("products").select("*").eq("is_available", true).order("sort_order"),
      supabase.from("business_settings").select("*").single(),
      supabase.from("promotions").select("*").eq("is_active", true).order("sort_order"),
    ]);

  const cats = (categories ?? []) as Category[];
  const prods = (products ?? []) as Product[];
  const config = settings as BusinessSettings | null;
  const closed = config ? !isOpenNow(config) : false;
  const featured = prods[0] ?? null;
  const promotions = (promos ?? []) as Promotion[];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#faf7f2] font-sans">
      {/* Cabecera oscura con marca, horario y carrito */}
      <header className="relative overflow-hidden bg-gradient-to-b from-[#0b0e14] via-[#1a1202] to-[#261603] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F0C000]/20 via-[#C05000]/15 to-transparent"
        />
        <div className="relative z-10 flex flex-col gap-3 px-4 pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <CalebLogo size="sm" priority />
              <div>
                <h1 className="font-display font-black text-2xl leading-none tracking-tight text-[#F0C000]">
                  Pollería Don Caleb
                </h1>
                <span className="font-sans font-bold text-xs uppercase tracking-wider text-[#F0A000] leading-tight block mt-0.5">
                  Tarma, Perú
                </span>
                <p className="text-[11px] text-amber-100/90 leading-snug mt-1 font-medium italic">
                  Pollos y broasters riquísimos
                  <br />Bueno, bonito, barato y bastante.
                </p>
              </div>
            </div>
            <CartHeaderButton />
          </div>

          {/* Barra estado + horario */}
          <div className="flex items-center justify-between rounded-xl border border-[#F0C000]/20 bg-black/40 px-3 py-2 backdrop-blur-sm">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                closed ? "bg-amber-500/25 text-amber-300" : "bg-emerald-500/25 text-emerald-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${closed ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`}
              />
              {closed ? "Cerrado" : "Abierto"}
            </span>
            {config && (
              <span className="inline-flex items-center gap-1.5 text-xs text-stone-200 font-medium">
                <Clock className="size-3.5 text-[#F0C000]" aria-hidden />
                Hoy: {to12h(config.open_time)} – {to12h(config.close_time)}
              </span>
            )}
            <ChevronRight className="size-4 text-stone-400" aria-hidden />
          </div>
        </div>

        {/* Curva inferior hacia la zona clara */}
        <div className="relative h-4 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-8 rounded-t-[1.25rem] bg-[#faf7f2]" />
        </div>
      </header>

      <HomeCatalog
        categories={cats}
        products={prods}
        featured={featured}
        promotions={promotions}
        closed={closed}
      />
    </main>
  );
}
