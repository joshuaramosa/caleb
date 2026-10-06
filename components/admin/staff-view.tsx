"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { StaffUser, UserRole } from "@/types";
import {
  ArrowLeft,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
  ChefHat,
  Bike,
  Headphones,
  Phone,
} from "lucide-react";
import {
  createStaffMember,
  updateStaffMember,
  toggleStaffActive,
} from "@/app/admin/(panel)/usuarios/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface StaffViewProps {
  staffList: StaffUser[];
  currentUserId: string;
}

export function StaffView({ staffList, currentUserId }: StaffViewProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);

  // Campos de creación
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("ATENCION");

  // Campos de edición
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("ATENCION");
  const [editActive, setEditActive] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const openCreate = () => {
    setNewEmail("");
    setNewPassword("");
    setNewName("");
    setNewPhone("");
    setNewRole("ATENCION");
    setIsCreateOpen(true);
  };

  const openEdit = (staff: StaffUser) => {
    setEditingStaff(staff);
    setEditName(staff.full_name);
    setEditPhone(staff.phone || "");
    setEditRole(staff.role);
    setEditActive(staff.is_active);
    setIsEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", newEmail);
    formData.append("password", newPassword);
    formData.append("full_name", newName);
    formData.append("phone", newPhone);
    formData.append("role", newRole);

    const res = await createStaffMember(formData);
    setIsLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Usuario registrado con éxito");
      setIsCreateOpen(false);
      router.refresh();
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append("id", editingStaff.id);
    formData.append("full_name", editName);
    formData.append("phone", editPhone);
    formData.append("role", editRole);
    formData.append("is_active", editActive ? "true" : "false");

    const res = await updateStaffMember(formData);
    setIsLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Personal actualizado");
      setIsEditOpen(false);
      router.refresh();
    }
  };

  const handleToggle = async (userId: string, current: boolean) => {
    const res = await toggleStaffActive(userId, current);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(current ? "Acceso desactivado" : "Acceso reactivado");
      router.refresh();
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4 text-purple-600" />;
      case "ATENCION":
        return <Headphones className="h-4 w-4 text-blue-600" />;
      case "COCINA":
        return <ChefHat className="h-4 w-4 text-amber-600" />;
      case "REPARTIDOR":
        return <Bike className="h-4 w-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm" className="h-9 gap-1 text-xs">
          <Link href="/admin/configuracion">
            <ArrowLeft className="h-3.5 w-3.5" />
            Configuración
          </Link>
        </Button>
        <Button
          onClick={openCreate}
          size="sm"
          className="h-9 bg-primary text-primary-foreground font-bold gap-1 text-xs"
        >
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="space-y-2.5">
        {staffList.map((staff) => {
          const isMe = staff.id === currentUserId;

          return (
            <div
              key={staff.id}
              className="rounded-2xl border bg-card p-3.5 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  {getRoleIcon(staff.role)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-foreground truncate">
                      {staff.full_name}
                    </h3>
                    {isMe && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                        Tú
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="font-semibold text-foreground/80">
                      {staff.role}
                    </span>
                    {staff.phone && (
                      <span className="flex items-center gap-0.5 text-[11px]">
                        • <Phone className="h-3 w-3" /> {staff.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isMe}
                  onClick={() => handleToggle(staff.id, staff.is_active)}
                  className="h-8 px-2 text-xs"
                  title={staff.is_active ? "Desactivar" : "Activar"}
                >
                  {staff.is_active ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-zinc-400" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEdit(staff)}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Crear Personal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-sm p-5">
          <DialogHeader className="border-b pb-3 text-left">
            <DialogTitle className="text-base font-bold">
              Registrar Personal
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 pt-2 text-sm">
            <div className="space-y-1">
              <Label htmlFor="u-name">Nombre completo *</Label>
              <Input
                id="u-name"
                placeholder="Carlos Mendoza"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="u-email">Correo electrónico *</Label>
              <Input
                id="u-email"
                type="email"
                placeholder="carlos@caleb.pe"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="u-pass">Contraseña temporal *</Label>
              <Input
                id="u-pass"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="u-phone">Celular</Label>
                <Input
                  id="u-phone"
                  placeholder="987654321"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="u-role">Rol *</Label>
                <select
                  id="u-role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full h-10 rounded-md border border-input bg-background px-2.5 py-2 text-xs shadow-xs focus:ring-2 focus:ring-primary outline-none font-semibold"
                >
                  <option value="ATENCION">ATENCION</option>
                  <option value="COCINA">COCINA</option>
                  <option value="REPARTIDOR">REPARTIDOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="w-full sm:w-auto h-9"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto h-9 font-bold bg-primary text-primary-foreground"
              >
                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                Crear Usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Personal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-sm p-5">
          <DialogHeader className="border-b pb-3 text-left">
            <DialogTitle className="text-base font-bold">
              Editar Personal
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEdit} className="space-y-3 pt-2 text-sm">
            <div className="space-y-1">
              <Label htmlFor="ed-name">Nombre completo *</Label>
              <Input
                id="ed-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="ed-phone">Celular</Label>
                <Input
                  id="ed-phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="ed-role">Rol *</Label>
                <select
                  id="ed-role"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full h-10 rounded-md border border-input bg-background px-2.5 py-2 text-xs shadow-xs focus:ring-2 focus:ring-primary outline-none font-semibold"
                >
                  <option value="ATENCION">ATENCION</option>
                  <option value="COCINA">COCINA</option>
                  <option value="REPARTIDOR">REPARTIDOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="ed-act">Estado de acceso</Label>
              <select
                id="ed-act"
                value={editActive ? "true" : "false"}
                onChange={(e) => setEditActive(e.target.value === "true")}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="true">✅ Activo (Puede ingresar)</option>
                <option value="false">❌ Inactivo (Acceso bloqueado)</option>
              </select>
            </div>

            <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="w-full sm:w-auto h-9"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto h-9 font-bold bg-primary text-primary-foreground"
              >
                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
