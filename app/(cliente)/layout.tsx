import { BottomNav } from "@/components/cliente/bottom-nav";

/** Layout de la zona pública del cliente: añade espacio inferior para la
 *  barra de navegación fija tipo app (Inicio, Carta, Pedidos, Perfil). */
export default function ClientLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <div className="pb-20">{children}</div>
      <BottomNav />
    </>
  );
}
