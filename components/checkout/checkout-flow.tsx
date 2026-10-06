"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useCart, useCartSubtotal } from "@/hooks/use-cart";
import { useMounted } from "@/hooks/use-mounted";
import { createOrder } from "@/app/checkout/actions";
import { saveOrder } from "@/lib/order-memory";
import { getProfile, saveProfile } from "@/lib/customer-profile";
import { formatSoles } from "@/lib/business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { TermsNote } from "@/components/cliente/terms-note";
import type { BusinessSettings } from "@/types";

const LocationMap = dynamic(() => import("./location-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-52 w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
      Cargando mapa…
    </div>
  ),
});

const PHONE_RE = /^9\d{8}$/;

export function CheckoutFlow({ settings }: { settings: BusinessSettings | null }) {
  const { items, clear } = useCart();
  const subtotal = useCartSubtotal();
  const mounted = useMounted();

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<{ token: string; number: number } | null>(null);

  // Precarga perezosa del perfil guardado en el teléfono (tab Perfil / compras previas).
  // Inicialización perezosa: evita setState dentro de un efecto.
  const [name, setName] = useState(() =>
    typeof window === "undefined" ? "" : getProfile()?.name ?? "",
  );
  const [phone, setPhone] = useState(() =>
    typeof window === "undefined" ? "" : getProfile()?.phone ?? "",
  );

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "error">("idle");
  const [reference, setReference] = useState(() =>
    typeof window === "undefined" ? "" : getProfile()?.reference ?? "",
  );

  const [paymentMethod, setPaymentMethod] = useState<"YAPE" | "CONTRA_ENTREGA" | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const deliveryFee = Number(settings?.delivery_fee ?? 0);
  const total = subtotal + deliveryFee;

  useEffect(() => {
    return () => {
      if (proofPreview) URL.revokeObjectURL(proofPreview);
    };
  }, [proofPreview]);

  if (!mounted) return null;

  // ---------- Carrito vacío ----------
  if (!order && items.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-6xl" aria-hidden>🛒</p>
        <h1 className="text-lg font-semibold">No tienes nada en tu carrito</h1>
        <Button asChild size="lg">
          <Link href="/carta">Ver la carta</Link>
        </Button>
      </main>
    );
  }

  // ---------- Pedido creado ----------
  if (order) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-6xl" aria-hidden>✅</p>
        <h1 className="text-2xl font-bold">¡Pedido recibido!</h1>
        <p className="text-lg">
          Tu pedido es el{" "}
          <span className="font-bold text-caleb-600">#{String(order.number).padStart(3, "0")}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Te avisaremos cuando lo estemos preparando. Este pedido quedó guardado en tu teléfono.
        </p>
        <Button asChild size="lg" className="w-full max-w-xs">
          <Link href={`/pedido/${order.token}`}>Ver estado de mi pedido</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/mis-pedidos">Mis pedidos</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/carta">Volver a la carta</Link>
        </Button>
      </main>
    );
  }

  // ---------- Handlers ----------
  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const requestLocation = () => {
    // El GPS solo funciona en contexto seguro (HTTPS o localhost).
    // Abrir la app como http://192.168.x.x bloquea la geolocalización silenciosamente.
    if (!window.isSecureContext) {
      setGpsStatus("error");
      showError("Tu ubicación solo funciona abriendo la app con HTTPS (o instalándola desde Perfil). Escribe tu dirección completa en la referencia mientras tanto.");
      return;
    }
    if (!navigator.geolocation) {
      setGpsStatus("error");
      showError("Tu navegador no soporta GPS. Escríbenos tu dirección completa en la referencia.");
      return;
    }
    setGpsStatus("loading");
    setError(null);

    const onSuccess = (pos: GeolocationPosition) => {
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setGpsStatus("idle");
    };
    const onFail = (err: GeolocationPositionError) => {
      console.error("[checkout] Error de geolocalización:", err.code, err.message);
      setGpsStatus("error");
      if (err.code === err.PERMISSION_DENIED) {
        showError("Denegaste el permiso de ubicación. Actívalo en los ajustes del navegador o escribe tu dirección completa en la referencia.");
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        showError("No pudimos obtener tu ubicación (GPS sin señal). Intenta en un lugar despejado o escribe tu dirección.");
      } else {
        showError("Se agotó el tiempo al buscar tu ubicación. Inténtalo de nuevo o escribe tu dirección completa.");
      }
    };

    // 1) Intenta con alta precisión; si falla (p. ej. en interior), 2) reintenta sin ella.
    navigator.geolocation.getCurrentPosition(onSuccess, () => {
      navigator.geolocation.getCurrentPosition(onSuccess, onFail, {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000,
      });
    }, { enableHighAccuracy: true, timeout: 15000 });
  };

  // Comprime la foto en el propio teléfono antes de subirla:
  // las capturas/cámaras modernas pesan varios MB y sin esto la subida falla.
  // 1024px / 0.8 basta para leer un Yape y sube rápido incluso con mala señal.
  const MAX_SIDE = 1024;
  const compressImage = (file: File): Promise<Blob> =>
    new Promise((resolve, reject) => {
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
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("no-blob"))),
          "image/jpeg",
          0.8,
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("no-img"));
      };
      img.src = url;
    });

  const onPickProof = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showError("El comprobante debe ser una foto.");
      return;
    }
    try {
      const blob = await compressImage(file);
      const resized = new File([blob], "comprobante.jpg", { type: "image/jpeg" });
      setProofFile(resized);
      setProofPreview(URL.createObjectURL(resized));
      setError(null);
    } catch {
      // Fallback: si la compresión falla, intenta con el original
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    if (!name.trim()) return showError("Escribe tu nombre.");
    if (!PHONE_RE.test(phone)) return showError("Ingresa un celular válido de 9 dígitos (empieza con 9).");
    if (!reference.trim()) return showError("La referencia de tu dirección es obligatoria.");
    if (!paymentMethod) return showError("Elige cómo vas a pagar.");
    if (paymentMethod === "YAPE" && !proofFile)
      return showError("Sube la captura de tu Yape para continuar.");

    setSending(true);
    setError(null);
    try {
      const result = await createOrder(
        {
          customerName: name,
          phone,
          reference,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
          paymentMethod: paymentMethod as "YAPE" | "CONTRA_ENTREGA",
          items,
        },
        paymentMethod === "YAPE" ? proofFile : null,
      );
      if (!result.ok) {
        showError(result.error);
        toast.error(result.error);
      } else {
        clear();
        saveProfile({ name, phone, reference });
        saveOrder({
          token: result.trackingToken,
          number: result.orderNumber,
          total,
          placedAt: new Date().toISOString(),
        });
        setOrder({ token: result.trackingToken, number: result.orderNumber });
        window.scrollTo({ top: 0 });
      }
    } catch (e) {
      console.error("[checkout] Excepción enviando el pedido:", e);
      showError("⚠️ No pudimos completar el pedido. Comprueba tu conexión e inténtalo nuevamente.");
    } finally {
      setSending(false);
    }
  };

  // ---------- UI: formulario único ----------
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-4 pb-8">
      <header>
        <Link href="/carrito" className="text-sm text-muted-foreground">
          ← Volver al carrito
        </Link>
        <h1 className="text-xl font-bold">Completa tu pedido</h1>
      </header>

      {error && (
        <div
          ref={errorRef}
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error.startsWith("SUSPENDIDO|") ? (
            <>
              <p className="font-bold">⚠️ Tu número está suspendido</p>
              <p>
                Por una cancelación con gastos pendientes. Para reactivarlo debes pagar{" "}
                <strong>{formatSoles(Number(error.split("|")[1] ?? 0))}</strong> (tu pedido
                cancelado + S/5 de reactivación).
              </p>
              {settings?.whatsapp && (
                <Button asChild size="sm" className="mt-2 bg-emerald-600 font-bold text-white hover:bg-emerald-700">
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hola, mi número está suspendido y quiero reactivarlo pagando mi gasto pendiente.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    💬 Contactar a soporte por WhatsApp
                  </a>
                </Button>
              )}
            </>
          ) : (
            error
          )}
        </div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-5">
        {/* Datos */}
        <section className="flex flex-col gap-3" aria-label="Tus datos">
          <h2 className="font-semibold">👤 Tus datos</h2>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium">Tu nombre</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: María Pérez"
              autoComplete="name"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium">Tu celular</label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
              placeholder="Ej: 912345678"
              inputMode="numeric"
              autoComplete="tel"
            />
            <p className="text-xs text-muted-foreground">9 dígitos, empieza con 9. Sin cuenta ni contraseña.</p>
          </div>
        </section>

        {/* Ubicación */}
        <section className="flex flex-col gap-3" aria-label="¿Dónde te lo llevamos?">
          <h2 className="font-semibold">📍 ¿Dónde te lo llevamos?</h2>
          {!coords ? (
            <Button
              type="button"
              size="lg"
              variant="secondary"
              onClick={requestLocation}
              disabled={gpsStatus === "loading"}
            >
              {gpsStatus === "loading" ? "Obteniendo ubicación…" : "📍 USAR MI UBICACIÓN"}
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <LocationMap lat={coords.lat} lng={coords.lng} />
              <p className="text-xs text-muted-foreground">
                ✅ Ubicación lista. Solo la usamos para llevarte el pedido.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => { setCoords(null); requestLocation(); }}
              >
                Actualizar ubicación
              </Button>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reference" className="text-sm font-medium">
              Dirección y referencia <span className="text-destructive">*</span>
            </label>
            <textarea
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              rows={3}
              placeholder="Ej: Av. Los Olivos 123, casa azul con puerta negra, frente al parque"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </section>

        {/* Pago */}
        <section className="flex flex-col gap-3" aria-label="¿Cómo pagas?">
          <h2 className="font-semibold">💳 ¿Cómo pagas?</h2>
          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("YAPE")}
              aria-pressed={paymentMethod === "YAPE"}
              className={`rounded-lg border-2 p-4 text-left font-medium ${
                paymentMethod === "YAPE" ? "border-primary bg-primary/5" : "border-muted"
              }`}
            >
              💜 PAGAR CON YAPE
              <span className="block text-sm font-normal text-muted-foreground">
                Transfiere ahora y sube la captura.
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("CONTRA_ENTREGA")}
              aria-pressed={paymentMethod === "CONTRA_ENTREGA"}
              className={`rounded-lg border-2 p-4 text-left font-medium ${
                paymentMethod === "CONTRA_ENTREGA" ? "border-primary bg-primary/5" : "border-muted"
              }`}
            >
              💵 PAGAR AL RECIBIR
              <span className="block text-sm font-normal text-muted-foreground">
                Paga en efectivo cuando llegue tu pedido.
              </span>
            </button>
          </div>

          {paymentMethod === "YAPE" && (
            <Card>
              <CardContent className="flex flex-col gap-3 p-4">
                <p className="text-sm">
                  Yapea <strong>{formatSoles(total)}</strong> a{" "}
                   <strong>{settings?.yape_holder ?? "Don CALEB"}</strong>
                </p>
                <p className="text-xl font-bold tracking-wide">
                  {settings?.yape_number ?? "Número aún no configurado"}
                </p>
                {settings?.qr_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={settings.qr_url} alt="QR de Yape" className="mx-auto w-40 rounded-md" />
                )}
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">
                    Sube la captura de tu pago <span className="text-destructive">*</span>
                  </span>
                  {/* Inputs ocultos: el teléfono pide permiso de galería/cámara al abrirlos */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-label="Elegir imagen de la galería"
                    onChange={(e) => {
                      onPickProof(e.target.files?.[0] ?? null);
                      e.target.value = "";
                    }}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    aria-label="Tomar una foto con la cámara"
                    onChange={(e) => {
                      onPickProof(e.target.files?.[0] ?? null);
                      e.target.value = "";
                    }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 text-xs font-bold"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      🖼️ Elegir de galería
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 text-xs font-bold"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      📸 Tomar foto
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    El teléfono te pedirá permiso para acceder a tu galería o cámara.
                  </p>
                  {proofPreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={proofPreview} alt="Comprobante de pago" className="mx-auto w-40 rounded-md" />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Resumen */}
        <section className="flex flex-col gap-3" aria-label="Resumen">
          <h2 className="font-semibold">🧾 Resumen</h2>
          <div className="rounded-lg border p-4 text-sm">
            {items.map((i) => (
              <div key={i.productId} className="flex justify-between py-0.5">
                <span>{i.quantity} × {i.name}</span>
                <span>{formatSoles(i.price * i.quantity)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t pt-2 text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatSoles(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span>{formatSoles(deliveryFee)}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-bold">
              <span>Total</span>
              <span className="text-caleb-600">{formatSoles(total)}</span>
            </div>
          </div>
        </section>

        <Button type="submit" size="lg" className="h-14 w-full text-base font-bold" disabled={sending}>
          {sending ? "Enviando…" : "CONFIRMAR PEDIDO"}
        </Button>
        <TermsNote accion="Al confirmar tu pedido y guardar tus datos," />
      </form>
    </main>
  );
}
