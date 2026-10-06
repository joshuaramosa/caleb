"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleUserRound, KeyRound, MapPin, Pencil, Phone, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InstallAppButton } from "@/components/cliente/install-app-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getProfile,
  saveProfile,
  type CustomerProfile,
} from "@/lib/customer-profile";
import { useMounted } from "@/hooks/use-mounted";

const PHONE_RE = /^9\d{8}$/;

export default function PerfilPage() {
  const mounted = useMounted();
  // Inicialización perezosa: localStorage solo existe en el navegador.
  const [profile, setProfile] = useState<CustomerProfile>(() => {
    if (typeof window === "undefined") return { name: "", phone: "", reference: "" };
    return getProfile() ?? { name: "", phone: "", reference: "" };
  });
  // Si ya hay perfil guardado en el teléfono, arranca en modo lectura
  // (botón "Modificar"); si no, directo a editar (botón "Guardar").
  const [editing, setEditing] = useState(() => {
    if (typeof window === "undefined") return true;
    return !getProfile()?.name;
  });
  const [acceptTerms, setAcceptTerms] = useState(false);

  const set = (key: keyof CustomerProfile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile((p) => ({ ...p, [key]: e.target.value }));

  const onSave = () => {
    if (!profile.name.trim()) return toast.error("Escribe tu nombre.");
    if (!PHONE_RE.test(profile.phone)) {
      return toast.error("Ingresa un celular válido de 9 dígitos (empieza con 9).");
    }
    if (!acceptTerms) {
      return toast.error("Debes aceptar los Términos y Condiciones para guardar.");
    }
    saveProfile({
      name: profile.name.trim(),
      phone: profile.phone.trim(),
      reference: profile.reference.trim(),
    });
    setEditing(false);
    toast.success("Perfil guardado en este teléfono");
  };

  const onModify = () => setEditing(true);

  if (!mounted) return null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 p-4 pb-8">
      <header className="flex items-center gap-3 rounded-2xl bg-gradient-to-b from-[#141a26] to-[#0b0e14] p-4 shadow-lg shadow-black/25">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F0A000] shadow-md shadow-[#F0A000]/40 ring-2 ring-white/20">
          <CircleUserRound className="size-7 text-white" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            {editing || !profile.name.trim() ? "Tu perfil" : `Hola, ${profile.name.trim()}`}
          </h1>
          <p className="text-xs text-stone-400">
            Sin contraseñas: tus datos viven solo en este teléfono.
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-[#F0A000]/15 bg-white p-4 shadow-sm shadow-[#F0A000]/5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-name" className="font-semibold text-[#141a26]">Nombre</Label>
          <Input
            id="p-name"
            placeholder="Ej. Caleb"
            value={profile.name}
            onChange={set("name")}
            disabled={!editing}
            className="disabled:opacity-100 disabled:bg-stone-50 disabled:text-[#141a26] disabled:border-stone-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-phone" className="flex items-center gap-1.5 font-semibold text-[#141a26]">
            <Phone className="size-3.5 text-[#F0A000]" aria-hidden /> Celular
          </Label>
          <Input
            id="p-phone"
            inputMode="numeric"
            placeholder="ej. 987654321"
            value={profile.phone}
            onChange={set("phone")}
            maxLength={9}
            disabled={!editing}
            className="disabled:opacity-100 disabled:bg-stone-50 disabled:text-[#141a26] disabled:border-stone-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-ref" className="flex items-center gap-1.5 font-semibold text-[#141a26]">
            <MapPin className="size-3.5 text-[#F0A000]" aria-hidden /> Referencia de entrega
          </Label>
          <Input
            id="p-ref"
            placeholder="Ej. Casa azul con puerta negra, frente al parque"
            value={profile.reference}
            onChange={set("reference")}
            disabled={!editing}
            className="disabled:opacity-100 disabled:bg-stone-50 disabled:text-[#141a26] disabled:border-stone-200"
          />
        </div>

        {editing && (
          <label
            htmlFor="p-terms"
            className="flex items-start gap-2.5 rounded-xl border border-[#F0A000]/20 bg-[#fffdf5] p-3 text-xs leading-snug text-stone-600"
          >
            <input
              id="p-terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-[#F0A000]"
            />
            <span>
              He leído y acepto los{" "}
              <Link href="/terminos" className="font-bold text-[#C05000] underline underline-offset-2">
                Términos y Condiciones
              </Link>{" "}
              y el aviso de privacidad (Ley N.° 29733).
            </span>
          </label>
        )}

        {editing ? (
          <Button
            onClick={onSave}
            className="mt-1 h-11 rounded-xl bg-[#F0A000] font-bold text-white shadow-md shadow-[#F0A000]/40 hover:bg-[#C05000] active:scale-95"
          >
            <Save className="size-4 mr-1.5" aria-hidden /> Guardar
          </Button>
        ) : (
          <Button
            onClick={onModify}
            variant="outline"
            className="mt-1 h-11 rounded-xl border-[#F0A000]/40 font-bold text-[#C05000] hover:bg-[#fff8e6] hover:text-[#803000] active:scale-95"
          >
            <Pencil className="size-4 mr-1.5" aria-hidden /> Modificar
          </Button>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <InstallAppButton />
        <Button asChild variant="outline" className="w-full border-caleb-dark-800/20 text-caleb-dark-800 hover:bg-caleb-dark-900 hover:text-white">
          <Link href="/mis-pedidos">Ver mis pedidos anteriores</Link>
        </Button>
      </section>

      {/* Acceso discreto al panel del personal (admin, cocina, delivery) */}
      <div className="mt-2 border-t border-[#F0A000]/10 pt-3 text-center">
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <KeyRound className="size-3.5" aria-hidden />
          Acceso personal
        </Link>
      </div>
    </main>
  );
}
