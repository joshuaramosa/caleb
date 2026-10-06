"use client";

// Perfil local del cliente (sin cuenta): nombre, celular y referencia de
// dirección se guardan en el dispositivo después de la primera compra
// para agilizar los próximos pedidos y alimentar la pestaña Perfil.

export type CustomerProfile = {
  name: string;
  phone: string;
  reference: string;
};

const KEY = "caleb-perfil";

export function getProfile(): CustomerProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.name || !parsed?.phone) return null;
    return {
      name: String(parsed.name),
      phone: String(parsed.phone),
      reference: String(parsed.reference ?? ""),
    };
  } catch {
    return null;
  }
}

export function saveProfile(profile: CustomerProfile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    /* sin localStorage (incógnito estricto): no guarda */
  }
}

export function clearProfile() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
