"use client";

// Recuerdo local de pedidos del cliente (sin cuenta):
// el token de seguimiento es la única credencial, así que lo guardamos
// en el dispositivo para que pueda volver a ver su pedido.

export type SavedOrder = {
  token: string;
  number: number;
  total: number;
  placedAt: string; // ISO
};

const KEY = "caleb-mis-pedidos";

export function saveOrder(order: SavedOrder) {
  try {
    const list = getSavedOrders().filter((o) => o.token !== order.token);
    list.unshift(order);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 30)));
  } catch {
    // sin localStorage (modo incógnito estricto): no guarda
  }
}

export function getSavedOrders(): SavedOrder[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function removeSavedOrder(token: string) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify(getSavedOrders().filter((o) => o.token !== token)),
    );
  } catch {
    /* noop */
  }
}
