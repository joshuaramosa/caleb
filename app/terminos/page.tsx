import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { BusinessSettings } from "@/types";

export const metadata = {
  title: "Términos y Condiciones — CALEB",
  description: "Términos de uso, política de entregas y aviso de privacidad de Pollería Don Caleb.",
};
export const dynamic = "force-dynamic";

const ULTIMA_ACTUALIZACION = "25 de septiembre de 2026";

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-bold text-foreground">
        {n}. {title}
      </h2>
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default async function TerminosPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("business_settings").select("*").eq("id", 1).single();
  const settings = data as BusinessSettings | null;

  const negocio = settings?.business_name ?? "Pollería Don Caleb";
  const whatsapp = settings?.whatsapp ?? settings?.yape_number ?? null;
  const horario =
    settings ? `${settings.open_time.slice(0, 5)} a ${settings.close_time.slice(0, 5)}` : "según lo publicado en la app";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 p-4 pb-10">
      <header className="flex flex-col gap-1 pt-2">
        <Link href="/" className="text-sm text-muted-foreground">
          ← Volver al inicio
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Términos y Condiciones</h1>
        <p className="text-xs text-muted-foreground">
          {negocio} · Última actualización: {ULTIMA_ACTUALIZACION}
        </p>
      </header>

      <div className="flex flex-col gap-5 rounded-2xl border bg-card p-4">
        <Section n="1" title="El servicio">
          <p>
            {negocio} es un servicio de pedidos de comida a domicilio operado desde nuestro local.
            A través de esta aplicación puedes ver la carta, hacer tu pedido y seguirlo en tiempo
            real, sin crear cuenta ni contraseña.
          </p>
          <p>
            Nuestro horario de atención es de <strong>{horario}</strong> (hora de Perú). Fuera de
            ese horario la app no acepta pedidos.
          </p>
        </Section>

        <Section n="2" title="Pedidos">
          <p>
            Al confirmar un pedido declaras que los datos ingresados (nombre, celular y dirección)
            son reales y correctos. El pedido queda registrado con un número y un enlace de
            seguimiento que debes conservar.
          </p>
          <p>
            Nos reservamos el derecho de rechazar o cancelar pedidos cuando no haya stock, estemos
            fuera de horario o los datos sean insuficientes para la entrega.
          </p>
        </Section>

        <Section n="3" title="Precios y pagos">
          <p>
            Todos los precios se muestran en soles peruanos (S/) e incluyen los impuestos
            aplicables. El costo de delivery se muestra antes de confirmar el pedido.
          </p>
          <p>
            Puedes pagar con <strong>Yape</strong> (subiendo la captura del pago; el pedido se
            prepara una vez verificado el comprobante por nuestro personal) o <strong>al
            recibir</strong> en efectivo. Un pago Yape no verificado puede retrasar o cancelar tu
            pedido.
          </p>
        </Section>

        <Section n="4" title="Entregas">
          <p>
            El reparto se realiza dentro de la zona de cobertura del local. Los tiempos de entrega
            son estimados y pueden variar por tráfico, clima o demanda. Es tu responsabilidad estar
            disponible en la dirección indicada (o coordinar por celular) al momento de la entrega.
          </p>
          <p>
            Si el repartidor no logra entregarte el pedido por datos incorrectos o falta de
            respuesta, el pedido podría cancelarse y el pago Yape no se devuelve si el producto ya
            fue preparado.
          </p>
        </Section>

        <Section n="5" title="Cancelaciones y devoluciones">
          <ul className="list-disc pl-5">
            <li>
              Puedes cancelar sin costo mientras el pedido no haya pasado a <strong>En
              preparación</strong>, contactándonos de inmediato por WhatsApp.
            </li>
            <li>
              Si el error es nuestro (producto equivocado, mal estado o no entregado), te devolvemos
              el íntegro de tu pago por el mismo medio (Yape) o reponemos el pedido, a tu elección.
            </li>
            <li>
              No hay devolución una vez recibido y conforme el pedido.
            </li>
          </ul>
        </Section>

        <Section n="6" title="Comprobantes de Yape">
          <p>
            La captura de tu pago se usa únicamente para verificar la transacción. Se almacena de
            forma segura y solo puede verla el personal autorizado del negocio. No la compartimos
            con terceros.
          </p>
        </Section>

        <section id="privacidad" className="flex flex-col gap-2 rounded-xl bg-muted/40 p-3">
          <h2 className="text-base font-bold text-foreground">7. Aviso de privacidad</h2>
          <div className="text-sm leading-relaxed text-muted-foreground">
            <p>
              Conforme a la <strong>Ley N.º 29733 — Ley de Protección de Datos Personales del
              Perú</strong>, te informamos:
            </p>
            <ul className="list-disc pl-5">
              <li>
                <strong>En tu teléfono:</strong> tu nombre, celular y referencia se guardan solo
                en tu dispositivo (para no volver a escribirlos). Puedes modificarlos cuando
                quieras desde Perfil → “Modificar”.
              </li>
              <li>
                <strong>En el servidor:</strong> guardamos tu nombre, celular, dirección de entrega
                y tus pedidos, con el único fin de prepararte y llevarte el pedido.
              </li>
              <li>
                <strong>Tu ubicación GPS</strong> (si la compartes) solo se usa para dirigir el
                reparto y mostrarla en el mapa de seguimiento.
              </li>
              <li>
                <strong>Tracking en vivo:</strong> la ubicación del repartidor se muestra únicamente
                mientras tu pedido está “En camino”; al entregarse, se borra.
              </li>
              <li>
                No vendemos ni compartimos tus datos con terceros. Puedes pedir su rectificación o
                eliminación contactándonos.
              </li>
            </ul>
            <p>
              Al guardar tus datos en la app aceptas estos Términos y Condiciones y este aviso de
              privacidad.
            </p>
          </div>
        </section>

        <Section n="8" title="Modificaciones">
          <p>
            Podemos actualizar estos términos cuando sea necesario. La fecha de última
            actualización siempre estará visible al inicio de esta página.
          </p>
        </Section>

        <Section n="9" title="Contacto, ubicación y canales oficiales">
          <p>
            Estamos ubicados en <strong>Tarma, Perú</strong>. Para consultas, pedidos o reclamos puedes comunicarte a través de nuestros canales oficiales:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>WhatsApp / Teléfono:</strong>{" "}
              <a href="https://wa.me/51986749190" target="_blank" rel="noreferrer" className="font-bold text-caleb-600 underline">
                +51 986 749 190
              </a>
            </li>
            <li>
              <strong>Correo electrónico:</strong>{" "}
              <a href="mailto:polleriacalebsoficial@gmail.com" className="font-bold text-caleb-600 underline">
                polleriacalebsoficial@gmail.com
              </a>
            </li>
            <li>
              <strong>TikTok:</strong>{" "}
              <a href="https://www.tiktok.com/@polleriadoncaleboficial" target="_blank" rel="noreferrer" className="font-bold text-caleb-600 underline">
                @polleriadoncaleboficial
              </a>
            </li>
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            Horario de atención: Todos los días de 12:00 p. m. a 10:30 p. m.
          </p>
        </Section>
      </div>
    </main>
  );
}
