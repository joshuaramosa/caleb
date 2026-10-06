import { createClient } from "@/lib/supabase/server";
import { isOpenNow } from "@/lib/business";
import { CategoryNav } from "@/components/carta/category-nav";
import { ProductCard } from "@/components/carta/product-card";
import { CartButton } from "@/components/carta/cart-button";
import { CalebLogo } from "@/components/ui/caleb-logo";
import { Clock } from "lucide-react";
import type { Category, Product, BusinessSettings } from "@/types";

export const metadata = {
  title: "Carta Digital — Pollería Don Caleb Restaurante & Delivery",
  description: "Caldo de gallina, mostritos, broaster, chocolate, panqueques y picarones tradicionales.",
};

// La disponibilidad cambia en tiempo real: render dinámico siempre fresco.
export const dynamic = "force-dynamic";

export default async function CartaPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: products }, { data: settings }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("products")
      .select("*")
      .order("sort_order"),
    supabase.from("business_settings").select("*").single(),
  ]);

  const cats = (categories ?? []) as Category[];
  const prods = (products ?? []) as Product[];
  const config = settings as BusinessSettings | null;
  const closed = config ? !isOpenNow(config) : false;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Cabecera Gastronómica Premium Pollería Don Caleb 2026 */}
      <header className="relative overflow-hidden bg-gradient-to-b from-[#090d16] via-[#111827] to-[#1a0f0f] px-4 pt-6 pb-6 text-center text-white border-b border-caleb-gold-500/20 shadow-md">
        {/* Resplandor ambiental de fondo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-caleb-gold-500/20 via-caleb-600/15 to-transparent"
        />

        <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center">
          {/* Logo oficial Caleb enlazado al inicio */}
          <CalebLogo size="md" glow asLink href="/" priority />

          {/* H1: Pollería Don Caleb - Grande, pesado, serif display */}
          <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight mt-2 drop-shadow-sm">
            Pollería Don Caleb
          </h1>

          {/* UBICACIÓN & SLOGAN */}
          <span className="font-sans font-bold text-xs uppercase tracking-wider text-[#F0A000] select-none block mt-0.5 mb-1">
            Tarma, Perú
          </span>

          {/* Slogan */}
          <h2 className="font-sans font-medium text-xs sm:text-sm text-amber-100/90 tracking-wide max-w-sm">
            “POLLOS Y BROSTHERS RIQUISIMOS, BUENO, BONITO, BARATO Y BASTANTE”
          </h2>

          {/* Horario y estado en vivo */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span
              className={`font-sans inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md ${
                closed
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  closed ? "bg-amber-400" : "bg-emerald-400 animate-pulse"
                }`}
              />
              {closed ? "Cerrado por el momento" : "Abierto ahora"}
            </span>

            {config && (
              <span className="font-sans inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 border border-white/10 backdrop-blur-md">
                <Clock className="size-3 text-caleb-gold-400" />
                <span>
                  {config.open_time.slice(0, 5)} – {config.close_time.slice(0, 5)}
                </span>
              </span>
            )}
          </div>
        </div>
      </header>

      {closed && (
        <div className="font-sans bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-200">
          🕒 Estamos fuera del horario de atención. Puedes explorar la carta y planificar tu próximo pedido.
        </div>
      )}

      <CategoryNav categories={cats} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-28">
        {cats.map((cat) => {
          const items = prods.filter((p) => p.category_id === cat.id);
          if (items.length === 0) return null;
          return (
            <section
              key={cat.id}
              id={`cat-${cat.slug}`}
              className="scroll-mt-24 py-6 border-b border-border/40 last:border-b-0"
              aria-label={cat.name}
            >
              {/* H3: Serif display, tamaño medio */}
              <div className="mb-4">
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
                  {cat.name}
                </h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} closed={closed} />
                ))}
              </div>
            </section>
          );
        })}
        {prods.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            Muy pronto publicaremos nuestra carta 🍽️
          </p>
        )}
      </main>
      <CartButton />
    </div>
  );
}
