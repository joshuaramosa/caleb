"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import { formatSoles } from "@/lib/business";
import type { Product, Category } from "@/types";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Tags,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  toggleProductAvailability,
  deleteProduct,
} from "@/app/admin/(panel)/productos/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProductsListViewProps {
  initialProducts: (Product & { category?: Category })[];
  categories: Category[];
}

export function ProductsListView({
  initialProducts,
  categories,
}: ProductsListViewProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Sincronizar si cambia initialProducts desde SSR (patrón "adjust during render")
  const [prevInitialProducts, setPrevInitialProducts] = useState(initialProducts);
  if (prevInitialProducts !== initialProducts) {
    setPrevInitialProducts(initialProducts);
    setProducts(initialProducts);
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== "ALL" && p.category_id !== selectedCategory) {
        return false;
      }
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(term);
      const matchDesc = p.description?.toLowerCase().includes(term);
      return matchName || matchDesc;
    });
  }, [products, selectedCategory, searchTerm]);

  const handleToggleAvail = async (productId: string, current: boolean) => {
    setActionLoading(`avail-${productId}`);
    const res = await toggleProductAvailability(productId, !current);
    setActionLoading(null);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(!current ? "Producto marcado disponible" : "Producto marcado agotado");
      router.refresh();
    }
  };

  const handleDelete = async (productId: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${name}"?`)) return;

    setActionLoading(`del-${productId}`);
    const res = await deleteProduct(productId);
    setActionLoading(null);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Producto eliminado");
      router.refresh();
    }
  };

  const openNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openEdit = (prod: Product) => {
    setEditingProduct(prod);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-3">
      {/* Botones de acción superior */}
      <div className="flex items-center justify-between gap-2">
        <Button
          onClick={openNew}
          className="flex-1 h-11 bg-primary text-primary-foreground font-bold rounded-xl gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-11 rounded-xl text-xs font-semibold gap-1.5 px-3"
        >
          <Link href="/admin/categorias">
            <Tags className="h-4 w-4 text-primary" />
            Categorías
          </Link>
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar producto por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-11 bg-background text-sm rounded-xl"
        />
      </div>

      {/* Pestañas de categoría (scroll horizontal) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
        <button
          onClick={() => setSelectedCategory("ALL")}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors touch-manipulation ${
            selectedCategory === "ALL"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-background border text-muted-foreground hover:text-foreground"
          }`}
        >
          Todos ({products.length})
        </button>
        {categories.map((cat) => {
          const count = products.filter((p) => p.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors touch-manipulation ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-background border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Lista de productos */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card/60 p-8 text-center text-muted-foreground">
          <p className="font-medium text-sm">No se encontraron productos</p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Usa el botón &quot;Nuevo Producto&quot; para agregar items a tu carta.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredProducts.map((product) => {
            const isLoadingAvail = actionLoading === `avail-${product.id}`;
            const isLoadingDel = actionLoading === `del-${product.id}`;

            return (
              <div
                key={product.id}
                className="rounded-2xl border bg-card p-3 shadow-xs transition-all hover:shadow-md"
              >
                <div className="flex gap-3 items-center">
                  {/* Imagen en miniatura */}
                  <div className="h-16 w-16 rounded-xl border bg-muted/30 overflow-hidden shrink-0 flex items-center justify-center">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                    )}
                  </div>

                  {/* Datos del producto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-primary/80 uppercase">
                        {product.category?.name || "Plato"}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-foreground truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {product.description || "Sin descripción"}
                    </p>
                    <p className="text-sm font-black text-foreground mt-0.5">
                      {formatSoles(product.price)}
                    </p>
                  </div>
                </div>

                {/* Acciones de la tarjeta */}
                <div className="mt-3 pt-2 border-t flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant={product.is_available ? "outline" : "secondary"}
                    onClick={() => handleToggleAvail(product.id, product.is_available)}
                    disabled={isLoadingAvail}
                    className={`h-8 px-2.5 text-xs font-semibold gap-1 rounded-lg ${
                      product.is_available
                        ? "text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                        : "text-zinc-500 line-through"
                    }`}
                  >
                    {isLoadingAvail ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : product.is_available ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-500" />
                    )}
                    {product.is_available ? "Disponible" : "Agotado"}
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(product)}
                      className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={isLoadingDel}
                      className="h-8 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      {isLoadingDel ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Formulario.
          La key fuerza un remontaje al abrir/editar para que los useState
          se inicialicen con los valores correctos (fix: formulario "sucio"
          al alternar entre Nuevo y Editar). */}
      {isFormOpen && (
        <ProductFormDialog
          key={editingProduct?.id ?? "nuevo-producto"}
          product={editingProduct}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          categories={categories}
          onSaved={() => router.refresh()}
        />
      )}
    </div>
  );
}
