"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Product, Category } from "@/types";
import { saveProduct, uploadProductImage } from "@/app/admin/(panel)/productos/actions";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ProductFormDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSaved: () => void;
}

export function ProductFormDialog({
  product,
  isOpen,
  onClose,
  categories,
  onSaved,
}: ProductFormDialogProps) {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product ? product.price.toString() : "");
  const [categoryId, setCategoryId] = useState(
    product?.category_id || (categories[0]?.id ?? "")
  );
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [isAvailable, setIsAvailable] = useState(product ? product.is_available : true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // El diálogo se remonta (key) cada vez que se abre con otro producto,
  // así que los estados ya vienen inicializados correctamente.
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadProductImage(formData);
    setIsUploading(false);

    if ("url" in res && res.url) {
      setImageUrl(res.url);
      toast.success("Imagen subida con éxito");
    } else {
      toast.error(res.error || "Error al subir la imagen");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !categoryId) {
      toast.error("Por favor completa los campos requeridos.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    if (product?.id) {
      formData.append("id", product.id);
    }
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category_id", categoryId);
    formData.append("image_url", imageUrl);
    formData.append("is_available", isAvailable ? "true" : "false");

    const res = await saveProduct(formData);
    setIsSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(product ? "Producto actualizado" : "Producto creado");
      onSaved();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-md p-5">
        <DialogHeader className="border-b pb-3 text-left">
          <DialogTitle className="text-lg font-bold">
            {product ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-sm">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="prod-name">Nombre del plato o producto *</Label>
            <Input
              id="prod-name"
              placeholder="Ej. 1/4 Pollo a la Brasa con Papas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-10"
            />
          </div>

          {/* Categoría */}
          <div className="space-y-1.5">
            <Label htmlFor="prod-cat">Categoría *</Label>
            <select
              id="prod-cat"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-2 focus:ring-primary outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Precio y Disponibilidad */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prod-price">Precio (S/) *</Label>
              <Input
                id="prod-price"
                type="number"
                step="0.10"
                min="0"
                placeholder="24.90"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="h-10 font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-avail">Disponibilidad</Label>
              <select
                id="prod-avail"
                value={isAvailable ? "true" : "false"}
                onChange={(e) => setIsAvailable(e.target.value === "true")}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-2 focus:ring-primary outline-none font-medium"
              >
                <option value="true">✅ Disponible</option>
                <option value="false">❌ Agotado</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="prod-desc">Descripción / Ingredientes</Label>
            <Textarea
              id="prod-desc"
              placeholder="Incluye papas fritas crocantes, ensalada fresca y cremas de la casa."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Imagen */}
          <div className="space-y-2">
            <Label>Imagen del producto</Label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-xl border bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-9 w-full text-xs gap-1.5"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Subir foto desde dispositivo
                </Button>
                <Input
                  placeholder="O pega una URL de imagen..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto h-10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full sm:w-auto h-10 font-bold bg-primary text-primary-foreground"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {product ? "Guardar cambios" : "Crear producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
