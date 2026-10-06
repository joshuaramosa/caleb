"use client";

import { useSyncExternalStore } from "react";

/**
 * true solo en el cliente, tras la hidratación.
 * Útil para estados persistidos (localStorage) que no existen en SSR.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {}, // no requiere suscripción real
    () => true,
    () => false,
  );
}
