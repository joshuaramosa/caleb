import { requireRole } from "@/lib/auth/guards";
import { StaffHeader } from "@/components/staff-header";

export default async function DeliveryLayout({ children }: LayoutProps<"/">) {
  const staff = await requireRole(["REPARTIDOR", "ADMIN"]);

  return (
    <div className="flex min-h-screen flex-col">
      <StaffHeader title="Delivery" name={staff.full_name} role={staff.role} />
      {children}
    </div>
  );
}
