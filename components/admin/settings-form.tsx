"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BusinessSettings, UserRole } from "@/types";
import {
  updateBusinessSettings,
  uploadBusinessAsset,
} from "@/app/admin/(panel)/configuracion/actions";
import {
  Store,
  Clock,
  Bike,
  CreditCard,
  Users,
  Upload,
  Loader2,
  ChevronRight,
  QrCode,
  Image as ImageIcon,
  MapPin,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const StoreLocationPicker = dynamic(() => import("./store-location-picker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-52 w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
      Cargando mapa…
    </div>
  ),
});

interface SettingsFormProps {
  initialSettings: BusinessSettings;
  currentUserRole: UserRole;
}

export function SettingsForm({
  initialSettings,
  currentUserRole,
}: SettingsFormProps) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(initialSettings.business_name);
  const [whatsapp, setWhatsapp] = useState(initialSettings.whatsapp || "");
  const [yapeNumber, setYapeNumber] = useState(initialSettings.yape_number || "");
  const [yapeHolder, setYapeHolder] = useState(initialSettings.yape_holder || "");
  const [deliveryFee, setDeliveryFee] = useState(initialSettings.delivery_fee.toString());
  const [openTime, setOpenTime] = useState(initialSettings.open_time);
  const [closeTime, setCloseTime] = useState(initialSettings.close_time);
  const [isOpen, setIsOpen] = useState(initialSettings.is_open);
  const [logoUrl, setLogoUrl] = useState(initialSettings.logo_url || "/logo.png");
  const [qrUrl, setQrUrl] = useState(initialSettings.qr_url || "");
  const [storeLat, setStoreLat] = useState<number | null>(initialSettings.store_lat ?? null);
  const [storeLng, setStoreLng] = useState<number | null>(initialSettings.store_lng ?? null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "qr"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "logo") setUploadingLogo(true);
    else setUploadingQr(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("prefix", type);

    const res = await uploadBusinessAsset(formData);

    if (type === "logo") setUploadingLogo(false);
    else setUploadingQr(false);

    if ("url" in res && res.url) {
      if (type === "logo") setLogoUrl(res.url);
      else setQrUrl(res.url);
      toast.success(`${type === "logo" ? "Logo" : "QR"} subido correctamente`);
    } else {
      toast.error(res.error || "Error al subir la imagen");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("business_name", businessName);
    formData.append("whatsapp", whatsapp);
    formData.append("yape_number", yapeNumber);
    formData.append("yape_holder", yapeHolder);
    formData.append("delivery_fee", deliveryFee);
    formData.append("open_time", openTime);
    formData.append("close_time", closeTime);
    formData.append("is_open", isOpen ? "true" : "false");
    formData.append("logo_url", logoUrl);
    formData.append("qr_url", qrUrl);
    if (storeLat != null && storeLng != null) {
      formData.append("store_lat", storeLat.toFixed(7));
      formData.append("store_lng", storeLng.toFixed(7));
    }

    const res = await updateBusinessSettings(formData);
    setIsSubmitting(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Configuración guardada correctamente");
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      {/* Botón hacia administración de personal si es ADMIN */}
      {currentUserRole === "ADMIN" && (
        <Button
          asChild
          variant="outline"
          className="w-full h-12 rounded-2xl justify-between px-4 bg-card border shadow-xs"
        >
          <Link href="/admin/usuarios">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Users className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-foreground leading-tight">
                  Personal y Usuarios
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Gestiona cocineros, repartidores y atención
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </Button>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Interruptor de Atención Inmediata */}
        <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Estado del Negocio</h3>
                <p className="text-xs text-muted-foreground">
                  Control manual de recepción de pedidos
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isOpen ? "bg-emerald-600" : "bg-zinc-300 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isOpen ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="pt-2 border-t">
            <span
              className={`text-xs font-semibold ${
                isOpen ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {isOpen
                ? "🟢 Abierto (Clientes pueden pedir si está dentro del horario)"
                : "🔴 Cerrado manualmente (No se aceptan pedidos)"}
            </span>
          </div>
        </div>

        {/* Horarios de Atención */}
        <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="h-4 w-4" />
            <h3 className="text-sm font-bold text-foreground">Horario de Atención</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="open-time" className="text-xs">Hora de apertura</Label>
              <Input
                id="open-time"
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                required
                className="h-10 text-center font-bold"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="close-time" className="text-xs">Hora de cierre</Label>
              <Input
                id="close-time"
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                required
                className="h-10 text-center font-bold"
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Acepta horarios nocturnos que cruzan la medianoche (ej. 17:30 a 01:00).
          </p>
        </div>

        {/* Delivery y Datos Generales */}
        <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Bike className="h-4 w-4" />
            <h3 className="text-sm font-bold text-foreground">Datos del Negocio y Delivery</h3>
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="b-name" className="text-xs">Nombre comercial</Label>
              <Input
                id="b-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="b-wsp" className="text-xs">WhatsApp oficial</Label>
                <Input
                  id="b-wsp"
                  placeholder="987654321"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="b-fee" className="text-xs">Costo de envío (S/)</Label>
                <Input
                  id="b-fee"
                  type="number"
                  step="0.50"
                  min="0"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  required
                  className="h-10 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ubicación fija del local (origen de los repartos) */}
        <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <MapPin className="h-4 w-4" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Ubicación del local</h3>
              <p className="text-[11px] text-muted-foreground">
                Punto de origen de los repartos. Cámbiala si el negocio se muda.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full h-11 text-sm font-bold"
            disabled={gpsLoading}
            onClick={() => {
              if (!window.isSecureContext || !navigator.geolocation) {
                toast.error("El GPS necesita HTTPS. Marca la ubicación tocando el mapa.");
                return;
              }
              setGpsLoading(true);
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setStoreLat(pos.coords.latitude);
                  setStoreLng(pos.coords.longitude);
                  setGpsLoading(false);
                  toast.success("Ubicación del local fijada con tu GPS 📍");
                },
                (err) => {
                  console.error("[settings] GPS del local:", err.code, err.message);
                  setGpsLoading(false);
                  toast.error("No pudimos obtener tu ubicación. Toca el mapa para fijarla.");
                },
                { enableHighAccuracy: true, timeout: 15000 },
              );
            }}
          >
            <Navigation className="h-4 w-4 mr-1.5" aria-hidden />
            {gpsLoading ? "Obteniendo ubicación…" : "Usar mi ubicación actual (estoy en el local)"}
          </Button>

          <StoreLocationPicker
            lat={storeLat}
            lng={storeLng}
            onChange={(la, ln) => { setStoreLat(la); setStoreLng(ln); }}
          />
          <p className="text-[11px] text-muted-foreground">
            🏪 Toca el mapa para mover el pin exactamente a la puerta del local.
            {storeLat != null && storeLng != null && (
              <span className="ml-1 font-mono">
                ({storeLat.toFixed(5)}, {storeLng.toFixed(5)})
              </span>
            )}
          </p>
        </div>

        {/* Datos de Yape */}
        <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-purple-600">
            <CreditCard className="h-4 w-4" />
            <h3 className="text-sm font-bold text-foreground">Datos para Pago con Yape</h3>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="yape-num" className="text-xs">Número de Yape</Label>
                <Input
                  id="yape-num"
                  placeholder="987654321"
                  value={yapeNumber}
                  onChange={(e) => setYapeNumber(e.target.value)}
                  className="h-10 font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="yape-hold" className="text-xs">Titular de la cuenta</Label>
                <Input
                  id="yape-hold"
                  placeholder="Nombre y Apellido"
                  value={yapeHolder}
                  onChange={(e) => setYapeHolder(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            {/* Subida de QR de Yape */}
            <div className="pt-2 space-y-2">
              <Label className="text-xs">Código QR de Yape</Label>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-xl border bg-muted/30 overflow-hidden flex items-center justify-center shrink-0">
                  {qrUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrUrl} alt="QR Yape" className="h-full w-full object-contain" />
                  ) : (
                    <QrCode className="h-6 w-6 text-muted-foreground/40" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <input
                    type="file"
                    accept="image/*"
                    ref={qrInputRef}
                    onChange={(e) => handleUpload(e, "qr")}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => qrInputRef.current?.click()}
                    disabled={uploadingQr}
                    className="h-9 w-full text-xs gap-1.5"
                  >
                    {uploadingQr ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    Subir imagen QR
                  </Button>
                  <Input
                    placeholder="O URL del QR..."
                    value={qrUrl}
                    onChange={(e) => setQrUrl(e.target.value)}
                    className="h-7 text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Subida de Logo */}
            <div className="pt-2 space-y-2 border-t">
              <Label className="text-xs">Logo del restaurante</Label>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-xl border bg-muted/30 overflow-hidden flex items-center justify-center shrink-0">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <input
                    type="file"
                    accept="image/*"
                    ref={logoInputRef}
                    onChange={(e) => handleUpload(e, "logo")}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="h-9 w-full text-xs gap-1.5"
                  >
                    {uploadingLogo ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    Subir logo
                  </Button>
                  <Input
                    placeholder="O URL del logo..."
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="h-7 text-[11px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón Guardar Cambios */}
        <Button
          type="submit"
          disabled={isSubmitting || uploadingLogo || uploadingQr}
          className="w-full h-12 rounded-xl text-base font-bold bg-primary text-primary-foreground shadow-xs"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Guardar Configuración
        </Button>
      </form>
    </div>
  );
}
