import { requireRole } from "@/lib/auth/guards";
import { StaffHeader } from "@/components/staff-header";

export default async function CocinaLayout({ children }: LayoutProps<"/">) {
  const staff = await requireRole(["COCINA", "ADMIN"]);

  return (
    <div className="flex min-h-screen flex-col">
      <StaffHeader title="Cocina" name={staff.full_name} role={staff.role} />
      {children}
    </div>
  );
}
