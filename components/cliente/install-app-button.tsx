"use client";

import { useEffect, useState } from "react";
import { Download, Share, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMounted } from "@/hooks/use-mounted";

// Evento no tipado en TS estándar (Chrome/Android)
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function detectIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS se reporta como Mac, pero tiene pantalla táctil
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** Botón "Instalar app en tu teléfono": usa el prompt nativo en Android/Chrome
 *  y muestra instrucciones guiadas según el dispositivo y el contexto. */
export function InstallAppButton() {
  const mounted = useMounted();
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    // Estado derivado del entorno del navegador: se marca una vez al montar.
    if (standalone) setTimeout(() => setIsStandalone(true), 0);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setPromptEvent(null);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!mounted || isStandalone) return null;

  const onInstall = async () => {
    // 1) Android/Chrome con prompt disponible: instalación nativa directa
    if (promptEvent) {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") setPromptEvent(null);
      return;
    }

    // 2) Sin prompt: diagnosticar por qué no se puede instalar
    if (!window.isSecureContext) {
      toast.warning(
         "Para instalar la app necesitas abrirla con HTTPS. Abre el link https:// de Don CALEB (no http:// con números) o pídelo desplegado en internet.",
        { duration: 8000 },
      );
      return;
    }

    if (detectIos()) {
      toast.info(
        "En iPhone/iPad: toca el botón Compartir (⎋) y luego “Añadir a pantalla de inicio”.",
        { duration: 8000 },
      );
      return;
    }

    // Android sin prompt: el navegador aún no habilita la instalación
    // (p. ej. ya está instalada, es un navegador sin soporte, o falta poco uso).
    toast.info(
      "En Android: abre el menú ⋮ del navegador y elige “Instalar app” o “Añadir a pantalla de inicio”. Si no aparece, verifica que estés en Chrome con HTTPS.",
      { duration: 8000 },
    );
  };

  const secure = typeof window === "undefined" || window.isSecureContext;

  return (
    <Button variant="outline" onClick={onInstall} className="w-full gap-2">
      {promptEvent ? (
        <Download className="size-4" aria-hidden />
      ) : !secure ? (
        <TriangleAlert className="size-4" aria-hidden />
      ) : (
        <Share className="size-4" aria-hidden />
      )}
      Instalar la app en tu teléfono
    </Button>
  );
}
