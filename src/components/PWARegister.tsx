"use client";

import { useEffect } from "react";

// Client component untuk register service worker PWA & membersihkan cache v1 yang stale
export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Bersihkan cache lama cw-cache-v1 bila masih tertinggal di browser pengguna
    if ("caches" in window) {
      caches.keys().then((keys) => {
        const hadLegacy = keys.includes("cw-cache-v1");
        Promise.all(
          keys
            .filter((k) => k !== "cw-cache-v3")
            .map((k) => caches.delete(k))
        ).then(() => {
          if (hadLegacy && !sessionStorage.getItem("cw_sw_purged_v3")) {
            sessionStorage.setItem("cw_sw_purged_v3", "1");
            window.location.reload();
          }
        });
      });
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        registration.update().catch(() => {});
      })
      .catch((err) => {
        console.warn("[PWA] Service Worker registration failed:", err);
      });
  }, []);

  return null;
}
