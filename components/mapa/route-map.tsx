"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

/** Mapa de entrega 100% in-app (OpenStreetMap + ruta por calles vía OSRM, sin Google). */

function emojiIcon(emoji: string, bg: string) {
  return L.divIcon({
    html: `<div style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:9999px;background:${bg};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35);font-size:19px">${emoji}</div>`,
    className: "",
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

const driverIcon = emojiIcon("🛵", "#F0A000");
const destIcon = emojiIcon("🏠", "#16a34a");
const storeIcon = emojiIcon("🏪", "#0f172a");

type LatLng = [number, number];

function distMeters(a: LatLng, b: LatLng) {
  const R = 6371000;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function FitAll({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points).pad(0.25), { animate: true });
    } else if (points.length === 1) {
      map.setView(points[0], 16, { animate: true });
    }
  }, [points, map]);
  return null;
}

export default function RouteMap({
  destLat,
  destLng,
  storeLat = null,
  storeLng = null,
  /* GPS del repartidor tomado del propio dispositivo (vista repartidor) */
  watchDriver = false,
  /* …o posición del repartidor leída de la base (vista cliente) */
  driverLat = null,
  driverLng = null,
  heightClass = "h-64",
}: {
  destLat: number | null;
  destLng: number | null;
  storeLat?: number | null;
  storeLng?: number | null;
  watchDriver?: boolean;
  driverLat?: number | null;
  driverLng?: number | null;
  heightClass?: string;
}) {
  const dest: LatLng | null = destLat != null && destLng != null ? [destLat, destLng] : null;
  const store: LatLng | null = storeLat != null && storeLng != null ? [storeLat, storeLng] : null;

  const [watchedDriver, setWatchedDriver] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[]>([]);
  const routeOriginRef = useRef<LatLng | null>(null);

  // driver interno (GPS propio) o driver explícito (polling desde la base)
  const driver: LatLng | null =
    driverLat != null && driverLng != null ? [driverLat, driverLng] : watchedDriver;

  // 1) GPS del repartidor en vivo (pide permiso del navegador al activar)
  useEffect(() => {
    if (!watchDriver || !navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => setWatchedDriver([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [watchDriver]);

  // 2) Ruta real por calles con OSRM: origen = repartidor (si hay GPS), si no, la tienda
  const origin = driver ?? store;
  const originLat = origin?.[0];
  const originLng = origin?.[1];
  const destLatNum = dest?.[0];
  const destLngNum = dest?.[1];
  useEffect(() => {
    if (!origin || !dest) {
      return;
    }
    // No recalcular si el origen se movió menos de 30 m (ahorro de llamadas)
    if (routeOriginRef.current && distMeters(routeOriginRef.current, origin) < 30) return;
    routeOriginRef.current = origin;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLngNum},${destLatNum}?overview=full&geometries=geojson`,
        );
        const json = await res.json();
        const coords: [number, number][] =
          json?.routes?.[0]?.geometry?.coordinates?.map((c: [number, number]) => [c[1], c[0]] as LatLng) ?? [];
        if (!cancelled) setRoute(coords.length > 0 ? coords : [origin, dest]);
      } catch {
        if (!cancelled) setRoute([origin, dest]); // fallback: línea recta
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [originLat, originLng, destLatNum, destLngNum]); // eslint-disable-line react-hooks/exhaustive-deps

  const center = driver ?? dest ?? store ?? [-11.40519, -75.68105];

  return (
    <MapContainer
      center={center}
      zoom={16}
      scrollWheelZoom={false}
      className={`${heightClass} w-full rounded-lg`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {route.length > 1 && (
        <Polyline positions={route} pathOptions={{ color: "#F0A000", weight: 5, opacity: 0.9 }} />
      )}
      {driver && <Marker position={driver} icon={driverIcon} />}
      {dest && <Marker position={dest} icon={destIcon} />}
      {store && <Marker position={store} icon={storeIcon} />}
      <FitAll
        points={[driver, dest, store].filter((p): p is LatLng => p != null)}
      />
    </MapContainer>
  );
}