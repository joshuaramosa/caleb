"use client";

import { useEffect } from "react";

/** Registra el Service Worker solo en el cliente y en producción. */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Nota: en este setup el NODE_ENV del bundle cliente no es confiable,
    // así que registramos el SW siempre. En dev el SW solo cachea assets
    // estáticos; las navegaciones y datos de pedidos siempre van a la red.
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      // El SW (y por tanto la instalación PWA) requiere HTTPS; lo dejamos en
      // consola para diagnóstico sin interrumpir al usuario.
      console.warn("[pwa] No se pudo registrar el Service Worker:", err);
    });
  }, []);
  return null;
}
