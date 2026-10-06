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
import type { Category } from "@/types";
import {
  ArrowLeft,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  saveCategory,
  reorderCategory,
  toggleCategoryActive,
  deleteCategory,
} from "@/app/admin/(panel)/categorias/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CategoriesViewProps {
  categories: Category[];
}

export function CategoriesView({ categories }: CategoriesViewProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const openNew = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setIsDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setIsDialogOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      // Auto-generar slug
      const generated = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setActionLoading("save");
    const formData = new FormData();
    if (editingCategory) formData.append("id", editingCategory.id);
    formData.append("name", name);
    formData.append("slug", slug);

    const res = await saveCategory(formData);
    setActionLoading(null);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(editingCategory ? "Categoría guardada" : "Categoría creada");
      setIsDialogOpen(false);
      router.refresh();
    }
  };

  const handleReorder = async (catId: string, dir: "UP" | "DOWN") => {
    setActionLoading(`move-${catId}`);
    await reorderCategory(catId, dir);
    setActionLoading(null);
    router.refresh();
  };

  const handleToggle = async (catId: string, current: boolean) => {
    setActionLoading(`toggle-${catId}`);
    await toggleCategoryActive(catId, !current);
    setActionLoading(null);
    router.refresh();
  };

  const handleDelete = async (catId: string, catName: string) => {
    if (!confirm(`¿Eliminar la categoría "${catName}"?`)) return;

    setActionLoading(`del-${catId}`);
    const res = await deleteCategory(catId);
    setActionLoading(null);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Categoría eliminada");
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm" className="h-9 gap-1 text-xs">
          <Link href="/admin/productos">
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a Productos
          </Link>
        </Button>
        <Button
          onClick={openNew}
          size="sm"
          className="h-9 bg-primary text-primary-foreground font-bold gap-1 text-xs"
        >
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      <div className="space-y-2">
        {categories.map((cat, index) => {
          const isFirst = index === 0;
          const isLast = index === categories.length - 1;
          const isLoading = actionLoading === `move-${cat.id}`;

          return (
            <div
              key={cat.id}
              className="rounded-2xl border bg-card p-3 shadow-xs flex items-center justify-between gap-3"
            >
              {/* Controles de orden táctiles (Arriba / Abajo) */}
              <div className="flex flex-col gap-1 shrink-0">
                <Button
                  variant="secondary"
                  size="icon"
                  disabled={isFirst || isLoading}
                  onClick={() => handleReorder(cat.id, "UP")}
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                  title="Mover arriba"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  disabled={isLast || isLoading}
                  onClick={() => handleReorder(cat.id, "DOWN")}
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                  title="Mover abajo"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Información */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground truncate">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                    #{cat.sort_order}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  slug: /{cat.slug}
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggle(cat.id, cat.is_active)}
                  className="h-8 px-2 text-xs"
                  title={cat.is_active ? "Desactivar" : "Activar"}
                >
                  {cat.is_active ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-zinc-400" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEdit(cat)}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="h-8 px-2 text-xs text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Crear / Editar Categoría */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm p-5">
          <DialogHeader className="border-b pb-3 text-left">
            <DialogTitle className="text-base font-bold">
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3 pt-2 text-sm">
            <div className="space-y-1">
              <Label htmlFor="cat-name">Nombre de la categoría *</Label>
              <Input
                id="cat-name"
                placeholder="Ej. Pollos a la Brasa"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cat-slug">Identificador (slug) *</Label>
              <Input
                id="cat-slug"
                placeholder="pollos-a-la-brasa"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="h-10 font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Usado para anclaje de navegación en la carta.
              </p>
            </div>

            <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="w-full sm:w-auto h-9"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={actionLoading === "save"}
                className="w-full sm:w-auto h-9 font-bold bg-primary text-primary-foreground"
              >
                {actionLoading === "save" && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                )}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
