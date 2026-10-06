"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffRole } from "@/lib/auth/guards";

export async function toggleProductAvailability(productId: string, isAvailable: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
    .eq("id", productId);

  if (error) return { error: error.message };

  revalidatePath("/admin/productos");
  revalidatePath("/carta");
  return { success: true };
}

export async function saveProduct(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string | null;
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const price = parseFloat(formData.get("price") as string);
  const category_id = formData.get("category_id") as string;
  const image_url = (formData.get("image_url") as string)?.trim() || null;
  const is_available = formData.get("is_available") === "true";

  if (!name || isNaN(price) || price < 0 || !category_id) {
    return { error: "Datos del producto incompletos o inválidos." };
  }

  if (id) {
    // Editar
    const { error } = await supabase
      .from("products")
      .update({
        name,
        description,
        price,
        category_id,
        image_url,
        is_available,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { error: error.message };
  } else {
    // Crear
    const { error } = await supabase.from("products").insert({
      name,
      description,
      price,
      category_id,
      image_url,
      is_available,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/carta");
  return { success: true };
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    // Si tiene pedidos asociados en order_items, no se puede borrar directo
    return {
      error:
        "No se puede eliminar el producto porque forma parte de pedidos existentes. En su lugar, desactívalo o márcalo como agotado.",
    };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/carta");
  return { success: true };
}

export async function uploadProductImage(formData: FormData) {
  // El service role bypasea RLS: la verificación de rol es OBLIGATORIA aquí
  const auth = await requireStaffRole(["ADMIN"]);
  if (auth.error) return auth;

  const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    return { error: "No se seleccionó ningún archivo." };
  }

  const adminClient = createAdminClient();
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `product_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await adminClient.storage
    .from("products")
    .upload(fileName, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });

  if (error) {
    return { error: error.message };
  }

  const { data: publicUrlData } = adminClient.storage
    .from("products")
    .getPublicUrl(fileName);

  return { url: publicUrlData.publicUrl };
}
