"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveCategory(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string | null;
  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim().toLowerCase();

  if (!name || !slug) {
    return { error: "El nombre y el identificador (slug) son obligatorios." };
  }

  if (id) {
    const { error } = await supabase
      .from("categories")
      .update({ name, slug })
      .eq("id", id);

    if (error) return { error: error.message };
  } else {
    // Obtener el orden más alto
    const { data: lastCat } = await supabase
      .from("categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = (lastCat?.sort_order ?? 0) + 1;

    const { error } = await supabase
      .from("categories")
      .insert({ name, slug, sort_order: nextOrder, is_active: true });

    if (error) return { error: error.message };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/carta");
  return { success: true };
}

export async function reorderCategory(categoryId: string, direction: "UP" | "DOWN") {
  const supabase = await createClient();

  // Obtener todas las categorías ordenadas
  const { data: categories } = await supabase
    .from("categories")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (!categories || categories.length < 2) return { success: true };

  const currentIndex = categories.findIndex((c) => c.id === categoryId);
  if (currentIndex === -1) return { error: "Categoría no encontrada" };

  const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= categories.length) {
    return { success: true }; // Ya está en el límite
  }

  const currentCat = categories[currentIndex];
  const targetCat = categories[targetIndex];

  // Intercambiar sort_order
  await supabase
    .from("categories")
    .update({ sort_order: targetCat.sort_order })
    .eq("id", currentCat.id);

  await supabase
    .from("categories")
    .update({ sort_order: currentCat.sort_order })
    .eq("id", targetCat.id);

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/carta");
  return { success: true };
}

export async function toggleCategoryActive(categoryId: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ is_active: isActive })
    .eq("id", categoryId);

  if (error) return { error: error.message };

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/carta");
  return { success: true };
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();

  // Verificar si tiene productos
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (count && count > 0) {
    return {
      error:
        `Esta categoría contiene ${count} producto(s). Reasigna o elimina los productos antes de borrarla.`,
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", categoryId);

  if (error) return { error: error.message };

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/carta");
  return { success: true };
}
