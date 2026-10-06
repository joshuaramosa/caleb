"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronUp, ChevronDown, Eye, EyeOff, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  deletePromotion,
  reorderPromotion,
  togglePromotion,
  uploadPromotion,
} from "@/app/admin/(panel)/promociones/actions";
import type { Promotion } from "@/types";

const MAX_PROMOS = 5;

/** Comprime en el teléfono antes de subir (reel vertical 1080px máx). */
function compressImage(file: File): Promise<Blob> {
  const MAX_SIDE = 1080;
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(url);
      if (!ctx) return reject(new Error("no-canvas"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("no-blob"))), "image/jpeg", 0.85);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("no-img"));
    };
    img.src = url;
  });
}

export function PromotionsView({ promotions }: { promotions: Promotion[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeCount = promotions.filter((p) => p.is_active).length;
  const canAddMore = activeCount < MAX_PROMOS;

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen.");
      return;
    }
    setBusy(true);
    try {
      const blob = await compressImage(file);
      const compressed = new File([blob], "promo.jpg", { type: "image/jpeg" });
      const res = await uploadPromotion(compressed);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Promoción publicada 🎉");
        router.refresh();
      }
    } catch (e) {
      console.error("[promociones] Error comprimiendo/subiendo:", e);
      toast.error("No pudimos procesar la imagen. Prueba con otra.");
    } finally {
      setBusy(false);
    }
  };

  const run = async (promise: Promise<{ error?: string }>) => {
    setBusy(true);
    const res = await promise;
    setBusy(false);
    if (res.error) toast.error(res.error);
    else router.refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Contador */}
      <p className="text-sm text-muted-foreground">
        <span className={`font-bold ${canAddMore ? "text-green-600" : "text-destructive"}`}>
          {activeCount}/{MAX_PROMOS}
        </span>{" "}
        activas · las desactivadas no salen en el Inicio
      </p>

      {/* Zona de subida */}
      {canAddMore ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-8 text-center transition-colors hover:bg-primary/10 disabled:opacity-50"
        >
          <ImagePlus className="size-8 text-primary" aria-hidden />
          <span className="text-sm font-bold text-primary">
            {busy ? "Subiendo…" : "Subir imagen de promoción"}
          </span>
          <span className="text-xs text-muted-foreground">
            Tamaño ideal: 1080 × 1350 px (vertical 4:5). Cualquier otra se ajusta completa
            con relleno difuminado. JPG o WebP, máx. 2 MB (se comprime sola al subir).
          </span>
        </button>
      ) : (
        <p className="rounded-lg bg-amber-500/10 p-3 text-sm font-medium text-amber-700">
          Límite alcanzado: 5 promociones activas. Desactiva o elimina una para agregar otra.
        </p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Subir imagen de promoción"
        onChange={(e) => {
          void handleUpload(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      {/* Lista */}
      {promotions.map((p, idx) => (
        <Card key={p.id} className={p.is_active ? "" : "opacity-60"}>
          <CardContent className="flex items-center gap-3 p-3">
            <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image src={p.image_url} alt={`Promoción ${idx + 1}`} fill sizes="64px" className="object-cover" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-sm font-bold">
                Posición {idx + 1}
                {!p.is_active && (
                  <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                    Oculta
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(p.created_at).toLocaleDateString("es-PE")}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <Button
                variant="outline"
                size="icon"
                aria-label="Subir posición"
                disabled={busy || idx === 0}
                onClick={() => run(reorderPromotion(p.id, "UP"))}
              >
                <ChevronUp className="size-4" aria-hidden />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Bajar posición"
                disabled={busy || idx === promotions.length - 1}
                onClick={() => run(reorderPromotion(p.id, "DOWN"))}
              >
                <ChevronDown className="size-4" aria-hidden />
              </Button>
            </div>

            <div className="flex flex-col gap-1">
              <Button
                variant="outline"
                size="icon"
                aria-label={p.is_active ? "Ocultar" : "Mostrar"}
                disabled={busy}
                onClick={() => run(togglePromotion(p.id, !p.is_active))}
              >
                {p.is_active ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
              </Button>
              {confirmDeleteId === p.id ? (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 text-[10px] font-bold"
                  disabled={busy}
                  onClick={() => {
                    setConfirmDeleteId(null);
                    void run(deletePromotion(p.id, p.image_url));
                  }}
                >
                  ¿Borrar?
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Eliminar promoción"
                  disabled={busy}
                  className="text-destructive"
                  onClick={() => setConfirmDeleteId(p.id)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {promotions.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aún no hay promociones. Sube tu primera imagen 👆
        </p>
      )}
    </div>
  );
}
