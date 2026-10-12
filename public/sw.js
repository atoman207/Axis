/* Stale SW cleanup — this project does not use a service worker. */
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(self.registration.unregister());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })()
  );
});
