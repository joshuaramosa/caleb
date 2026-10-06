"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_PROMOS = 5;

/** Solo ADMIN puede gestionar las promociones del Inicio */
async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "No autorizado" as const, userId: null };

  const { data: staff } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("id", data.user.id)
    .single();

  if (!staff || !staff.is_active || staff.role !== "ADMIN") {
    return { error: "Solo el administrador puede gestionar las promociones.", userId: null };
  }
  return { error: null, userId: data.user.id };
}

/** Sube una imagen de promoción (JPEG ya comprimida en el cliente). */
export async function uploadPromotion(file: File | null) {
  const auth = await requireAdmin();
  if (auth.error) return auth;
  if (!file || file.size === 0) return { error: "No se seleccionó ninguna imagen." };
  if (!file.type.startsWith("image/")) return { error: "El archivo debe ser una imagen." };
  if (file.size > 5 * 1024 * 1024) return { error: "La imagen supera 5 MB." };

  const supabase = await createClient();

  // Límite duro también en servidor (además del trigger de la base)
  const { count } = await supabase
    .from("promotions")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);
  if ((count ?? 0) >= MAX_PROMOS) {
    return { error: "Ya tienes 5 promociones activas. Desactiva o elimina una para subir otra." };
  }

  // 1. Subir imagen al bucket público
  const admin = createAdminClient();
  const fileName = `promo_${Date.now()}.jpg`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from("promotions")
    .upload(fileName, buffer, { contentType: "image/jpeg" });
  if (upErr) {
    console.error("[promociones] Error subiendo imagen:", upErr.message);
    return { error: "No pudimos subir la imagen. Inténtalo de nuevo." };
  }
  const { data: urlData } = admin.storage.from("promotions").getPublicUrl(fileName);

  // 2. Insertar al final del orden
  const { data: last } = await supabase
    .from("promotions")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("promotions").insert({
    image_url: urlData.publicUrl,
    sort_order: (last?.sort_order ?? 0) + 1,
    is_active: true,
  });
  if (error) {
    if (error.message.includes("MAX_5_PROMOS")) {
      return { error: "Ya tienes 5 promociones activas. Desactiva o elimina una para subir otra." };
    }
    console.error("[promociones] Error insertando promo:", error.message);
    return { error: "No pudimos guardar la promoción." };
  }

  revalidatePath("/");
  revalidatePath("/admin/promociones");
  return { success: true };
}

export async function togglePromotion(id: string, isActive: boolean) {
  const auth = await requireAdmin();
  if (auth.error) return auth;

  const supabase = await createClient();
  const { error } = await supabase.from("promotions").update({ is_active: isActive }).eq("id", id);
  if (error) {
    if (error.message.includes("MAX_5_PROMOS")) {
      return { error: "Ya hay 5 promociones activas. Desactiva otra primero." };
    }
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/promociones");
  return { success: true };
}

/** Lógica idéntica al reordenamiento de categorías: intercambio de sort_order. */
export async function reorderPromotion(id: string, direction: "UP" | "DOWN") {
  const auth = await requireAdmin();
  if (auth.error) return auth;

  const supabase = await createClient();
  const { data: all } = await supabase
    .from("promotions")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (!all || all.length < 2) return { success: true };

  const currentIndex = all.findIndex((p) => p.id === id);
  if (currentIndex === -1) return { error: "Promoción no encontrada" };

  const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= all.length) return { success: true };

  const current = all[currentIndex];
  const target = all[targetIndex];

  await supabase.from("promotions").update({ sort_order: target.sort_order }).eq("id", current.id);
  await supabase.from("promotions").update({ sort_order: current.sort_order }).eq("id", target.id);

  revalidatePath("/");
  revalidatePath("/admin/promociones");
  return { success: true };
}

export async function deletePromotion(id: string, imageUrl: string) {
  const auth = await requireAdmin();
  if (auth.error) return auth;

  const supabase = await createClient();
  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) return { error: error.message };

  // Borrar el archivo del bucket (ruta = último segmento de la URL pública)
  const path = imageUrl.split("/promotions/").pop();
  if (path) await createAdminClient().storage.from("promotions").remove([path]);

  revalidatePath("/");
  revalidatePath("/admin/promociones");
  return { success: true };
}
