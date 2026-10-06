"use client";

import Image from "next/image";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatSoles } from "@/lib/business";
import { useCart } from "@/hooks/use-cart";
import { CalebLogo } from "@/components/ui/caleb-logo";
import type { Product } from "@/types";

function getProductImage(product: Product): string | null {
  if (product.image_url) return product.image_url;
  const name = product.name.toLowerCase();
  if (name.includes("caldo")) return "/dishes/caldo-de-gallina.jpg";
  if (name.includes("mostrito")) return "/dishes/mostrito-broaster.jpg";
  if (name.includes("broaster") || name.includes("pollo")) return "/dishes/pollo-broaster.jpg";
  if (name.includes("picarone")) return "/dishes/picarones.jpg";
  return null;
}

export function ProductCard({
  product,
  closed,
}: {
  product: Product;
  closed: boolean;
}) {
  const addItem = useCart((s) => s.addItem);
  const disabled = !product.is_available || closed;
  const displayImage = getProductImage(product);

  const handleAdd = () => {
    if (!product.is_available) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: displayImage,
    });
    toast.success(`${product.name} agregado al carrito`);
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-black/8 bg-white shadow-xs transition-all duration-200 hover:border-[#F0A000]/40 hover:shadow-md">
      {/* 1. Fotografía al ras superior, sin margen ni espacio blanco arriba */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#F0C000]/10 via-[#F0A000]/5 to-transparent p-2 text-center">
            <CalebLogo size="xs" priority={false} />
            <span className="mt-1 font-sans text-[9px] font-bold text-stone-500 uppercase tracking-wider">
              Don Caleb
            </span>
          </div>
        )}

        {!product.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs p-1">
            <Badge variant="destructive" className="font-sans font-bold text-[10px] sm:text-xs uppercase tracking-wider px-2 py-0.5">
              Agotado
            </Badge>
          </div>
        )}
      </div>

      {/* 2. Cuerpo de la tarjeta compacto */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3 gap-2">
        <div className="space-y-0.5">
          {/* Nombre del plato */}
          <h4 className="font-sans font-bold text-xs sm:text-sm text-stone-900 leading-snug line-clamp-2 tracking-tight">
            {product.name}
          </h4>

          {/* Descripción opcional */}
          {product.description && (
            <p className="font-sans font-normal text-[10px] text-stone-500 leading-tight line-clamp-1">
              {product.description}
            </p>
          )}
        </div>

        {/* Precio y Botón en fila armónica */}
        <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-stone-100">
          <span className="font-sans font-extrabold text-sm sm:text-base text-stone-900 leading-tight">
            {formatSoles(Number(product.price))}
          </span>

          <Button
            size="sm"
            disabled={disabled}
            onClick={handleAdd}
            aria-disabled={disabled}
            className="h-7 sm:h-8 px-2 sm:px-2.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide rounded-lg bg-[#F0A000] hover:bg-[#C05000] active:scale-95 text-white shadow-xs transition-all shrink-0 flex items-center gap-1"
          >
            <ShoppingCart className="size-3" aria-hidden />
            <span>{product.is_available ? "Agregar" : "Agotado"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
