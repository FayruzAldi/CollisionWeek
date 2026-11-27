import { NextRequest, NextResponse } from "next/server";

/**
 * Gerbang halaman di edge.
 *
 * Kenapa hanya memeriksa KEBERADAAN cookie, bukan tanda tangannya:
 * middleware berjalan di edge runtime, dan env yang dibaca di sini di-inline
 * saat build. Kalau kita memverifikasi HMAC di sini memakai SESSION_SECRET,
 * nilai yang ter-inline bisa berbeda dari nilai yang dipakai route handler
 * saat runtime (mis. secret diganti tanpa rebuild). Akibatnya cookie yang sah
 * akan ditolak middleware selamanya -> redirect loop ke /login.
 *
 * Jadi middleware hanya mencegah render halaman tanpa sesi (menghilangkan
 * kedipan konten sebelum redirect). Otorisasi yang sebenarnya tetap di route
 * handler: setiap route memanggil requireCapability, yang memverifikasi tanda
 * tangan cookie dan membaca peran terbaru dari database.
 */

const PUBLIC_PATHS = ["/login", "/about"];

// Rute yang dilayani Next sendiri; jangan diganggu.
const BYPASS_PREFIXES = [
  "/_next",
  "/api",
  "/csv-templates",
  "/icons",
  "/images",
  "/logos",
  "/mascots",
  "/manifest.json",
  "/sw.js",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/icon.svg",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (BYPASS_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  if (req.cookies.get("cw_session")?.value) {
    return NextResponse.next();
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  // Simpan tujuan semula supaya bisa dikembalikan setelah masuk.
  if (pathname !== "/") loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};