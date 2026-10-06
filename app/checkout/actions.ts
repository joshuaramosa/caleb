"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { CartItem } from "@/hooks/use-cart";

export type CheckoutPayload = {
  customerName: string;
  phone: string;
  reference: string;
  lat: number | null;
  lng: number | null;
  paymentMethod: "YAPE" | "CONTRA_ENTREGA";
  items: CartItem[];
};

export type CreateOrderResult =
  | { ok: true; trackingToken: string; orderNumber: number }
  | { ok: false; error: string };

const PHONE_RE = /^9\d{8}$/;

function mapRpcError(message: string): string {
  if (message.includes("NEGOCIO_CERRADO"))
    return "Pollería Don Caleb está cerrado ahora. Vuelve en nuestro horario de atención.";
  if (message.includes("CELULAR_INVALIDO")) return "Celular inválido.";
  if (message.includes("FALTA_NOMBRE")) return "Falta el nombre del cliente.";
  if (message.includes("REFERENCIA_OBLIGATORIA")) return "Falta la referencia de dirección.";
  if (message.includes("CARRITO_VACIO")) return "El carrito está vacío.";
  if (message.includes("PRODUCTO_NO_DISPONIBLE")) {
    const [, detail] = message.split("PRODUCTO_NO_DISPONIBLE:");
    return `"${detail ?? "Un producto"}" ya no está disponible.`;
  }
  if (message.includes("CLIENTE_BLOQUEADO")) {
    const [, debt] = message.split("CLIENTE_BLOQUEADO:");
    return `SUSPENDIDO|${debt ?? "0"}`;
  }
  return "⚠️ No pudimos completar el pedido. Comprueba tu conexión e inténtalo nuevamente.";
}

export async function createOrder(
  payload: CheckoutPayload,
  proofFile: File | null,
): Promise<CreateOrderResult> {
  // Validaciones rápidas para feedback inmediato (la base valida de nuevo dentro de la transacción)
  if (!payload.customerName.trim()) return { ok: false, error: "Falta el nombre del cliente." };
  if (!PHONE_RE.test(payload.phone)) return { ok: false, error: "Celular inválido." };
  if (!payload.reference.trim()) return { ok: false, error: "Falta la referencia de dirección." };
  if (payload.items.length === 0) return { ok: false, error: "El carrito está vacío." };
  if (payload.paymentMethod === "YAPE" && !proofFile)
    return { ok: false, error: "Falta el comprobante de Yape." };

  // Validación de archivo: solo imágenes de hasta 5 MB
  if (proofFile) {
    if (!proofFile.type.startsWith("image/"))
      return { ok: false, error: "El comprobante debe ser una imagen (foto o captura)." };
    if (proofFile.size > 5 * 1024 * 1024)
      return { ok: false, error: "La imagen del comprobante supera 5 MB." };
  }

  const supabase = createAdminClient();

  // Subir comprobante primero (fuera de la transacción); si el pedido falla, se borra.
  let proofPath: string | null = null;
  if (payload.paymentMethod === "YAPE" && proofFile) {
    const ext = proofFile.name.split(".").pop() ?? "jpg";
    proofPath = `tmp/${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await proofFile.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from("payment-proofs")
      .upload(proofPath, buffer, { contentType: proofFile.type });
    if (upErr) {
      console.error("[createOrder] Error subiendo comprobante:", upErr.message, upErr);
      return { ok: false, error: "No pudimos subir el comprobante. Inténtalo de nuevo." };
    }
  }

  // Creación transaccional del pedido
  const { data, error } = await supabase.rpc("create_order", {
    payload: {
      customer_name: payload.customerName,
      phone: payload.phone,
      reference: payload.reference,
      lat: payload.lat,
      lng: payload.lng,
      payment_method: payload.paymentMethod,
      items: payload.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
      })),
    },
  });

  if (error) {
    console.error("[createOrder] Error RPC create_order:", error.message, error);
    if (proofPath) await supabase.storage.from("payment-proofs").remove([proofPath]);
    return { ok: false, error: mapRpcError(error.message) };
  }

  const { order_id, order_number, tracking_token } = data as {
    order_id: string;
    order_number: number;
    tracking_token: string;
  };

  // Mover el comprobante a la carpeta definitiva del pedido y registrarlo.
  // Estos pasos NO deben tumbar el pedido ya creado: solo se registran en log.
  if (proofPath) {
    try {
      const finalPath = `${order_id}/comprobante${proofPath.slice(proofPath.lastIndexOf("."))}`;
      const { error: moveErr } = await supabase.storage
        .from("payment-proofs")
        .move(proofPath, finalPath);
      if (moveErr) {
        console.error("[createOrder] No se pudo mover el comprobante (se usa ruta temporal):", moveErr.message);
      }
      const effectivePath = moveErr ? proofPath : finalPath;
      const { error: payErr } = await supabase
        .from("payments")
        .update({ proof_url: effectivePath })
        .eq("order_id", order_id);
      if (payErr) console.error("[createOrder] No se pudo registrar proof_url:", payErr.message);
    } catch (e) {
      console.error("[createOrder] Excepción registrando comprobante:", e);
    }
  }

  return { ok: true, trackingToken: tracking_token, orderNumber: order_number };
}
