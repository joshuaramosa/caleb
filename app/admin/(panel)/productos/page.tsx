import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { ProductsListView } from "@/components/admin/products-list-view";
import type { Product, Category } from "@/types";

export const metadata = { title: "Gestión de Productos — Don Caleb Admin" };

export default async function AdminProductosPage() {
  await requireRole(["ADMIN"]);
  const supabase = await createClient();

  const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(*)")
      .order("sort_order", { ascending: true }),
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  const products: (Product & { category?: Category })[] = productsData || [];
  const categories: Category[] = categoriesData || [];

  return (
    <main className="max-w-6xl mx-auto p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Carta y Productos</h1>
        <p className="text-xs text-muted-foreground">
          Crea, edita precios, imágenes y controla la disponibilidad en vivo
        </p>
      </div>

      <ProductsListView
        initialProducts={products}
        categories={categories}
      />
    </main>
  );
}
