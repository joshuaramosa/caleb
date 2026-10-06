"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

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

/** Encuadra el mapa para ver motorizado y destino a la vez (suave). */
function FitAll({
  driver,
  others,
}: {
  driver: [number, number] | null;
  others: [number, number][];
}) {
  const map = useMap();
  useEffect(() => {
    const points = [...(driver ? [driver] : []), ...others];
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points).pad(0.3), { animate: true });
    } else if (points.length === 1) {
      map.setView(points[0], 16, { animate: true });
    }
  }, [driver?.[0], driver?.[1], others.length, map]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function LiveDeliveryMap({
  driverLat,
  driverLng,
  destLat,
  destLng,
  storeLat,
  storeLng,
}: {
  driverLat: number | null;
  driverLng: number | null;
  destLat: number | null;
  destLng: number | null;
  storeLat: number | null;
  storeLng: number | null;
}) {
  const driver: [number, number] | null =
    driverLat != null && driverLng != null ? [driverLat, driverLng] : null;
  const dest: [number, number] | null =
    destLat != null && destLng != null ? [destLat, destLng] : null;
  const store: [number, number] | null =
    storeLat != null && storeLng != null ? [storeLat, storeLng] : null;

  const center = driver ?? dest ?? store ?? [-11.40519, -75.68105];

  return (
    <MapContainer
      center={center}
      zoom={16}
      scrollWheelZoom={false}
      className="h-64 w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {driver && <Marker position={driver} icon={driverIcon} />}
      {dest && <Marker position={dest} icon={destIcon} />}
      {store && <Marker position={store} icon={storeIcon} />}
      <FitAll driver={driver} others={[dest, store].filter((p): p is [number, number] => p != null)} />
    </MapContainer>
  );
}
