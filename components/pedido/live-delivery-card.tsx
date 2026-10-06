"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

const RouteMap = dynamic(() => import("@/components/mapa/route-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
      Cargando mapa…
    </div>
  ),
});

type Tracking = {
  status: string;
  order_number: number;
  dest_lat: number | null;
  dest_lng: number | null;
  driver_lat: number | null;
  driver_lng: number | null;
  driver_updated_at: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  store_lat: number | null;
  store_lng: number | null;
};

/** Distancia haversine en km */
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** ETA aproximado en minutos (moto urbana ≈ 22 km/h + margen) */
function etaMinutes(km: number): number {
  return Math.max(1, Math.round((km / 22) * 60) + 2);
}

/**
 * Tarjeta de tracking en vivo estilo apps de delivery: mapa con el motorizado
 * 🛵 y el destino 🏠. Polling cada 10 s al RPC `get_order_tracking`
 * (canal anónimo no puede leer tablas por RLS; el RPC expone solo lo mínimo).
 */
export function LiveDeliveryCard({ token }: { token: string }) {
  const [tracking, setTracking] = useState<Tracking | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const fetchTracking = async () => {
      const { data, error } = await supabase.rpc("get_order_tracking", { p_token: token });
      if (!cancelled && !error && data) setTracking(data as Tracking);
    };

    void fetchTracking();
    const poll = setInterval(fetchTracking, 10_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void fetchTracking();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [token]);

  // Visible desde que hay repartidor asignado; el mapa en vivo solo en EN_CAMINO
  if (!tracking || !["ASIGNADO", "EN_CAMINO"].includes(tracking.status)) return null;

  const onTheWay = tracking.status === "EN_CAMINO";
  const hasGps = tracking.driver_lat != null && tracking.driver_lng != null;
  const destName = tracking.driver_name?.split(" ")[0] ?? "Tu repartidor";
  const driverPhone = tracking.driver_phone?.replace(/\D/g, "") || null;

  const eta =
    onTheWay && hasGps && tracking.dest_lat != null && tracking.dest_lng != null
      ? etaMinutes(
          distanceKm(tracking.driver_lat!, tracking.driver_lng!, tracking.dest_lat, tracking.dest_lng),
        )
      : null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold">
            🛵 {destName} {onTheWay ? "va en camino" : "fue asignado a tu pedido"}
            {eta != null && (
              <span className="text-caleb-600"> · llega en ~{eta} min</span>
            )}
          </p>
          {onTheWay && (
            <span className="flex items-center gap-1.5 text-xs text-green-600" title="Ubicación en vivo">
              <span className="relative flex size-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-green-600" />
              </span>
              EN VIVO
            </span>
          )}
        </div>

        {/* Perfil del repartidor asignado */}
        {tracking.driver_name && (
          <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/40 p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#F0A000] text-base font-black text-white">
                {tracking.driver_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">{tracking.driver_name}</p>
                <p className="text-xs text-muted-foreground">Tu repartidor</p>
              </div>
            </div>
            {driverPhone && (
              <a
                href={`https://wa.me/51${driverPhone}?text=${encodeURIComponent(
                  `Hola ${tracking.driver_name}, soy el cliente del pedido #${String(tracking.order_number).padStart(3, "0")}.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white active:scale-95"
              >
                💬 Chatear
              </a>
            )}
          </div>
        )}

        {onTheWay &&
          (hasGps ? (
            <>
              <RouteMap
                driverLat={tracking.driver_lat}
                driverLng={tracking.driver_lng}
                destLat={tracking.dest_lat}
                destLng={tracking.dest_lng}
                storeLat={tracking.store_lat}
                storeLng={tracking.store_lng}
              />
              <p className="text-xs text-muted-foreground">
                🛵 tu pedido · 🏠 tu dirección · 🏪 local{eta == null && " · comparte tu ubicación en el checkout para estimar la llegada"}
              </p>
            </>
          ) : (
            <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              El motorizado ya salió 🛵 Activa su GPS y verás su ubicación aquí en vivo.
            </p>
          ))}
      </CardContent>
    </Card>
  );
}
