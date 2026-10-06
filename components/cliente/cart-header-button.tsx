"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartCount } from "@/hooks/use-cart";
import { useMounted } from "@/hooks/use-mounted";

/** Botón de carrito del header (mockup): icono con badge de cantidad. */
export function CartHeaderButton() {
  const mounted = useMounted();
  const count = useCartCount();

  return (
    <Link
      href="/carrito"
      aria-label={`Ir al carrito (${count} ítems)`}
      className="relative rounded-full bg-white/10 p-2.5 transition-colors hover:bg-white/20"
    >
      <ShoppingCart className="size-5" aria-hidden />
      {mounted && count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-[#141924]">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
