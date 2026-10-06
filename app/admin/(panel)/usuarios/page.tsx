import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { StaffView } from "@/components/admin/staff-view";
import type { StaffUser } from "@/types";

export const metadata = { title: "Personal y Usuarios — Don Caleb Admin" };

export default async function AdminUsuariosPage() {
  // Solo ADMIN puede gestionar usuarios
  const adminStaff = await requireRole(["ADMIN"]);
  const supabase = await createClient();

  const { data: usersData } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: true });

  const staffList: StaffUser[] = usersData || [];

  return (
    <main className="max-w-6xl mx-auto p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Personal y Roles</h1>
        <p className="text-xs text-muted-foreground">
          Crea cuentas para cocina, repartidores, atención y administradores
        </p>
      </div>

      <StaffView
        staffList={staffList}
        currentUserId={adminStaff.id}
      />
    </main>
  );
}
