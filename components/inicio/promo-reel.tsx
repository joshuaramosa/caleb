"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Promotion } from "@/types";

const SLIDE_MS = 5000; // cada imagen dura 5 segundos

/**
 * Reel de promociones: imágenes verticales a pantalla completa dentro del card,
 * avance automático cada 5 s, barras de progreso arriba (estilo historias),
 * tocar izquierda/derecha para navegar, mantener presionado para pausar.
 */
export function PromoReel({ promotions }: { promotions: Promotion[] }) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 dentro de la imagen actual
  const [paused, setPaused] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const carriedRef = useRef(0);

  const count = promotions.length;

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % count) + count) % count);
      setProgress(0);
      carriedRef.current = 0;
      startRef.current = performance.now();
    },
    [count],
  );

  // Motor de avance: requestAnimationFrame para llenar la barra con suavidad
  useEffect(() => {
    if (count <= 1) return;
    startRef.current = performance.now();

    const tick = (now: number) => {
      if (!paused && document.visibilityState === "visible") {
        const elapsed = carriedRef.current + (now - startRef.current);
        const p = Math.min(1, elapsed / SLIDE_MS);
        setProgress(p);
        if (p >= 1) {
          goTo(index + 1);
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
      } else {
        // al pausar: congelar lo avanzado y reiniciar el reloj
        carriedRef.current = Math.min(
          SLIDE_MS,
          carriedRef.current + (now - startRef.current),
        );
        startRef.current = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [index, paused, count, goTo]);

  if (count === 0) return null;

  return (
    <section className="px-4" aria-label="Promociones">
      <div
        // Alto = 70% del original (aspect 4/5 → 8/7), un 30% menos de altura.
        className="relative aspect-[8/7] overflow-hidden rounded-3xl bg-black shadow-lg select-none"
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
        onClick={(e) => {
          // Zonas de toque: izquierda = atrás, derecha = adelante
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x < rect.width * 0.35) goTo(index - 1);
          else goTo(index + 1);
        }}
      >
        {/* Imágenes apiladas con crossfade */}
        {promotions.map((p, i) => (
          <div
            key={p.id}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Relleno difuminado para que cualquier proporción se vea completa y elegante */}
            <Image
              src={p.image_url}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 420px"
              className="object-cover blur-2xl opacity-60 scale-110"
              draggable={false}
              aria-hidden
            />
            <Image
              src={p.image_url}
              alt={`Promoción ${i + 1}`}
              fill
              priority={i === 0}
              sizes="(max-width: 640px) 100vw, 420px"
              className="object-contain"
              draggable={false}
            />
          </div>
        ))}

        {/* Barras de progreso estilo historias */}
        {count > 1 && (
          <div className="absolute inset-x-3 top-3 z-10 flex gap-1.5" aria-hidden>
            {promotions.map((p, i) => (
              <div key={p.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-full rounded-full bg-white"
                  style={{
                    width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Indicador de pausa */}
        {paused && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <span className="rounded-full bg-black/50 px-4 py-2 text-sm font-bold text-white">
              ⏸ Pausa
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
