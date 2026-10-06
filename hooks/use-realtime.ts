"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type RealtimeEventPayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, unknown>;
  old: Record<string, unknown>;
};

type Subscription = {
  table: string;
  event?: "*" | "INSERT" | "UPDATE" | "DELETE";
  filter?: string; // ej. "id=eq.123"
};

/**
 * Suscripción Realtime con manejo de reconexión.
 * - Llama a onPayload por cada cambio.
 * - Tras reconexión (canal caído → resuscrito), llama a onResync para refetch de respaldo.
 */
export function useRealtime(
  topic: string,
  subscriptions: Subscription[],
  onPayload: (sub: Subscription, payload: RealtimeEventPayload) => void,
  onResync?: () => void,
) {
  const [status, setStatus] = useState<"connecting" | "live" | "reconnecting">("connecting");
  const wasDown = useRef(false);
  const callbacks = useRef({ onPayload, onResync });

  useEffect(() => {
    callbacks.current = { onPayload, onResync };
  }, [onPayload, onResync]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(topic);

    for (const sub of subscriptions) {
      channel.on(
        "postgres_changes",
        {
          event: sub.event ?? "*",
          schema: "public",
          table: sub.table,
          ...(sub.filter ? { filter: sub.filter } : {}),
        },
        (payload) =>
          callbacks.current.onPayload(sub, payload as unknown as RealtimeEventPayload),
      );
    }

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        if (wasDown.current) {
          wasDown.current = false;
          callbacks.current.onResync?.(); // refetch de respaldo tras reconexión
        }
        setStatus("live");
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        wasDown.current = true;
        setStatus("reconnecting");
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, JSON.stringify(subscriptions)]);

  return status;
}
