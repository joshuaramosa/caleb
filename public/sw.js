// Service Worker CALEB — carga rápida sin cachear datos de pedidos.
const STATIC_CACHE = "caleb-static-v1";
const IMG_CACHE = "caleb-img-v1";

// Rutas que jamás deben cachearse (datos dinámicos de la operación)
const ALWAYS_NETWORK = ["/checkout", "/carrito", "/pedido", "/admin", "/cocina", "/delivery"];

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== STATIC_CACHE && k !== IMG_CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/icons") ||
    url.pathname.startsWith("/dishes") ||
    url.pathname.startsWith("/img") ||
    url.pathname === "/logo.png"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegaciones y datos de la app: siempre red primero (datos frescos de pedidos)
  const isNavigation = request.mode === "navigate";
  const isAppData = ALWAYS_NETWORK.some((p) => url.pathname.startsWith(p));
  if (isNavigation || isAppData || url.pathname.startsWith("/_next/data")) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request)),
    );
    return;
  }

  // Assets estáticos e imágenes: cache primero, red de respaldo
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              const cacheName = url.pathname.startsWith("/icons") || url.pathname.startsWith("/dishes") || url.pathname.startsWith("/img") ? IMG_CACHE : STATIC_CACHE;
              caches.open(cacheName).then((c) => c.put(request, clone));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // Resto: network primero
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
