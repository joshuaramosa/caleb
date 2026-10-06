"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useMounted } from "@/hooks/use-mounted";
import { formatSoles } from "@/lib/business";

/** Barra flotante inferior con total y cantidad; siempre visible al navegar la carta. */
export function CartButton() {
  const count = useCart((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
  const total = useCart((s) => s.items.reduce((acc, i) => acc + i.price * i.quantity, 0));
  const mounted = useMounted(); // el carrito lee localStorage solo en el cliente

  if (!mounted || count === 0) return null;

  // Flota sobre la barra de navegación inferior del cliente (bottom nav)
  return (
    <div className="fixed inset-x-0 bottom-20 z-30 p-3 pb-1">
      <Link
        href="/carrito"
        className="mx-auto flex max-w-md items-center justify-between rounded-full bg-primary px-5 py-3.5 text-primary-foreground shadow-lg"
      >
        <span className="flex items-center gap-2 font-semibold">
          <ShoppingCart className="size-5" aria-hidden />
          {count} {count === 1 ? "ítem" : "ítems"}
        </span>
        <span className="font-bold">{formatSoles(total)}</span>
      </Link>
    </div>
  );
}
