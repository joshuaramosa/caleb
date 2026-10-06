"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Cerro de Pasco / centro de operaciones por defecto si el local aún no tiene GPS
const DEFAULT_CENTER: [number, number] = [-11.40519, -75.68105];

function ClickToMove({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

/** Mapa para fijar la ubicación del local: clic/toque mueve el pin. */
export default function StoreLocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const center: [number, number] =
    lat != null && lng != null ? [lat, lng] : DEFAULT_CENTER;
  const hasPin = lat != null && lng != null;

  return (
    <MapContainer
      center={center}
      zoom={hasPin ? 17 : 14}
      scrollWheelZoom={false}
      className="h-52 w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToMove onPick={onChange} />
      {hasPin && <Marker position={[lat, lng]} icon={markerIcon} />}
      {hasPin && <Recenter lat={lat} lng={lng} />}
    </MapContainer>
  );
}
