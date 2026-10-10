/* Bible App service worker.
 * - Shell cache (versioned per build): index.html, hashed JS/CSS from index.html, icons, manifest, offline page.
 * - Runtime cache (versioned per build): other same-origin GET requests (stale-while-revalidate).
 * - Data cache (NOT versioned per build): Bible text chunks under /data/ (cache-first).
 * __BUILD_ID__ is replaced at build time by vite.config.js.
 */
const BUILD_ID = "__BUILD_ID__";
const SHELL_CACHE = `bible-shell-${BUILD_ID}`;
const RUNTIME_CACHE = `bible-runtime-${BUILD_ID}`;
const DATA_CACHE = "bible-data-v1";
const KNOWN = [SHELL_CACHE, RUNTIME_CACHE, DATA_CACHE];
const STATIC_SHELL = [
  "/offline.html",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await Promise.all(
        STATIC_SHELL.map((url) => cache.add(url).catch(() => null)),
      );
      try {
        const res = await fetch("/", { cache: "reload" });
        if (res.ok) {
          const html = await res.clone().text();
          await cache.put("/index.html", res);
          const urls = new Set();
          const re = /(?:src|href)="(\/assets\/[^"]+)"/g;
          let m;
          while ((m = re.exec(html))) urls.add(m[1]);
          await Promise.all(
            [...urls].map((u) => cache.add(u).catch(() => null)),
          );
        }
      } catch (e) {
        /* offline during install: the shell will be filled at runtime */
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => n.startsWith("bible-") && !KNOWN.includes(n))
          .map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

async function networkFirstNavigation(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(request, { signal: controller.signal });
    clearTimeout(timer);
    if (
      res.ok &&
      res.headers.get("content-type")?.includes("text/html") &&
      !new URL(request.url).pathname.includes(".")
    ) {
      cache.put("/index.html", res.clone()).catch(() => null);
    }
    return res;
  } catch (e) {
    return (
      (await cache.match("/index.html")) ||
      (await cache.match("/offline.html")) ||
      Response.error()
    );
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok && res.type === "basic")
    cache.put(request, res.clone()).catch(() => null);
  return res;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const hit = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res.ok && res.type === "basic")
        cache.put(request, res.clone()).catch(() => null);
      return res;
    })
    .catch(() => null);
  return hit || (await network) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/sw.js") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }
  if (url.pathname.startsWith("/data/")) {
    event.respondWith(
      cacheFirst(request, DATA_CACHE).catch(() => Response.error()),
    );
    return;
  }
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      (async () => {
        const shell = await caches.open(SHELL_CACHE);
        const hit = await shell.match(request);
        if (hit) return hit;
        return cacheFirst(request, RUNTIME_CACHE).catch(() => Response.error());
      })(),
    );
    return;
  }
  event.respondWith(staleWhileRevalidate(request));
});
