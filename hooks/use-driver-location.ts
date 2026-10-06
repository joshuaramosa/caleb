"use client";

import { useEffect, useRef, useState } from "react";
import { updateDriverLocation } from "@/app/delivery/actions";

const MIN_INTERVAL_MS = 15_000; // cada 15 s (balance batería/fluidez)
const MIN_DISTANCE_M = 25; // si no se movió, no molestamos al servidor

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type DriverGpsState = "off" | "starting" | "live" | "error";

/**
 * Comparte el GPS del repartidor mientras tenga entregas EN_CAMINO.
 * `activeIds`: assignment ids con status EN_CAMINO.
 * `enabled`: el repartidor lo activa con un botón — el gesto del usuario
 * garantiza que el navegador muestre el diálogo de permiso de ubicación.
 * Se detiene cuando se desactiva, no hay entregas en camino o se desmonta.
 */
export function useDriverLocation(activeIds: string[], enabled: boolean): DriverGpsState {
  const [state, setState] = useState<DriverGpsState>("off");
  const lastSentAt = useRef(0);
  const lastPos = useRef<{ lat: number; lng: number } | null>(null);
  const key = activeIds.join(",");

  useEffect(() => {
    const ids = key ? key.split(",") : [];
    if (!enabled || ids.length === 0) {
      setState("off");
      return;
    }
    if (!navigator.geolocation || !window.isSecureContext) {
      setState("error");
      return;
    }

    setState("starting");
    let gotFix = false;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (!gotFix) {
          gotFix = true;
          setState("live");
        }
        const now = Date.now();
        const prev = lastPos.current;
        const movedEnough = !prev || distanceMeters(prev.lat, prev.lng, lat, lng) >= MIN_DISTANCE_M;
        if (!movedEnough || now - lastSentAt.current < MIN_INTERVAL_MS) return;

        lastSentAt.current = now;
        lastPos.current = { lat, lng };
        // Enviar la misma posición a cada entrega activa (mismo motorizado)
        ids.forEach((id) => {
          void updateDriverLocation(id, lat, lng).catch(() => {
            /* se reintenta en el siguiente tick del GPS */
          });
        });
      },
      (err) => {
        console.error("[delivery] Error de GPS:", err.code, err.message);
        setState("error");
      },
      { enableHighAccuracy: true, maximumAge: 10_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [key, enabled]);

  return state;
}