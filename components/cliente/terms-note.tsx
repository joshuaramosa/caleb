import Link from "next/link";

/** Aviso de aceptación: se usa donde el cliente guarda sus datos (Perfil, Checkout). */
export function TermsNote({ accion }: { accion: string }) {
  return (
    <p className="text-center text-[11px] leading-snug text-muted-foreground">
      {accion} aceptas nuestros{" "}
      <Link
        href="/terminos"
        className="font-bold text-caleb-600 underline underline-offset-2"
      >
        Términos y Condiciones
      </Link>
      .
    </p>
  );
}
