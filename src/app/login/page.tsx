"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { UserProfile } from "@/lib/types";
import Image from "next/image";
import { UniversityLogos } from "@/components/UniversityAssets";
import { UserAvatar } from "@/components/ui/UserAvatar";

// Role badge colors
const ROLE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  ADMIN: { bg: "bg-purple-100 text-purple-700 border-purple-200", text: "text-purple-700", label: "Admin" },
  LECTURER: { bg: "bg-blue-100 text-blue-700 border-blue-200", text: "text-blue-700", label: "Dosen" },
  STUDENT: { bg: "bg-emerald-100 text-emerald-700 border-emerald-200", text: "text-emerald-700", label: "Mahasiswa" },
};

// Mascot pose per active tab
const TAB_MASCOT: Record<string, { campus: string; pose: string }> = {
  STUDENT: { campus: "binus", pose: "working.webp" },
  LECTURER: { campus: "telkom", pose: "calculating.webp" },
  ADMIN: { campus: "umk", pose: "peer-help.webp" },
};

export default function LoginPage() {
  const router = useRouter();
  const { users, login, isLoading } = useRole();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"ADMIN" | "LECTURER" | "STUDENT">("STUDENT");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [mascotLoaded, setMascotLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tujuan setelah masuk, diisi middleware saat halaman diproteksi dialihkan.
  // Hanya path lokal yang diterima: nilai berawalan "//" atau berskema bisa
  // dipakai untuk open redirect ke domain lain.
  const nextPath = (() => {
    if (typeof window === "undefined") return null;
    const raw = new URLSearchParams(window.location.search).get("next");
    if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
    return raw;
  })();

  // 40 mahasiswa terdaftar; tanpa pencarian, daftar sepanjang ini tidak
  // terpakai. Kotak cari menyaring berdasarkan nama atau email.
  const [query, setQuery] = useState("");
  const usersOfRole = users
    .filter((u) => u.role === activeTab)
    .filter((u) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    });
  const mascot = TAB_MASCOT[activeTab];

  const handleLogin = async () => {
    if (!selectedUser) return;
    setIsLoggingIn(true);
    // Peran tidak dikirim dari sini: server membacanya dari database dan
    // menandatanganinya ke cookie. Mengubah objek user di browser tidak
    // menaikkan hak akses.
    const result = await login(selectedUser.id);
    if (!result.ok) {
      setError(result.error || "Gagal masuk.");
      setIsLoggingIn(false);
      return;
    }
    // Kembali ke halaman yang tadi dituju (middleware menyimpannya di ?next=).
    router.replace(nextPath || "/");
  };

  useEffect(() => {
    setSelectedUser(null);
    setQuery("");
    setMascotLoaded(false);
    setError(null);
  }, [activeTab]);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col">
      {/* Top bar */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <Image
            src="/icon.svg"
            alt="Collision Week"
            width={32}
            height={32}
            className="w-8 h-8"
            priority
            unoptimized
          />
          <div>
            <p className="text-[13px] font-semibold text-slate-800 leading-none">Collision Week</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Academic Load Balancer</p>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:block">GDGoC ITB · STACK 2026</span>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left panel: branding + mascot */}
        <div className="hidden lg:flex lg:w-[420px] flex-shrink-0 bg-indigo-600 flex-col justify-between p-10 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-indigo-500/40" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-indigo-700/50" />

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-lg shadow-indigo-900/20">
              <Image
                src="/icon.svg"
                alt=""
                width={44}
                height={44}
                className="w-11 h-11"
                unoptimized
              />
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight mb-3">
              Kelola beban<br />akademikmu<br />dengan cerdas.
            </h1>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Visualisasi tabrakan jadwal, ajukan pergeseran tenggat, dan
              minta bantuan sub-topik dari sesama mahasiswa.
            </p>
          </div>

          {/* Mascot display */}
          <div className="relative z-10 flex flex-col items-center py-4">
            <div
              className="relative w-48 h-48 transition-opacity duration-300"
              style={{ opacity: mascotLoaded ? 1 : 0 }}
            >
              <Image
                src={`/mascots/${mascot.campus}/${mascot.pose}`}
                alt={`Maskot ${mascot.campus}`}
                fill
                className="object-contain drop-shadow-xl"
                unoptimized
                onLoad={() => setMascotLoaded(true)}
              />
            </div>
            {!mascotLoaded && (
              <div className="w-48 h-48 rounded-full bg-white/10 animate-pulse" />
            )}
            <p className="text-indigo-300 text-xs mt-2 font-medium text-center">
              {activeTab === "STUDENT" && "Yuk, mulai kelola jadwalmu!"}
              {activeTab === "LECTURER" && "Pantau dan seimbangkan beban kelas."}
              {activeTab === "ADMIN" && "Kelola dan optimalkan jadwal kampus."}
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <p className="text-indigo-300 text-xs font-medium uppercase tracking-widest">Platform akademik untuk</p>
            <UniversityLogos layout="row" size="lg" />
            <p className="text-indigo-400 text-[11px] mt-2">
              Dikembangkan untuk kompetisi STACK 2026 · GDGoC ITB
            </p>
          </div>
        </div>

        {/* Right panel: login */}
        <div className="flex-1 flex items-start lg:items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-sm">
            {/* Mobile brand */}
            <div className="lg:hidden mb-6 text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-white ring-1 ring-slate-200 flex items-center justify-center mx-auto mb-3">
                <Image
                  src="/icon.svg"
                  alt="Collision Week"
                  width={44}
                  height={44}
                  className="w-11 h-11"
                  unoptimized
                />
              </div>
              {/* Mascot kecil di mobile */}
              <div className="relative w-20 h-20 mx-auto">
                <Image
                  src={`/mascots/${mascot.campus}/${mascot.pose}`}
                  alt={`Maskot ${mascot.campus}`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <h1 className="text-xl font-bold text-slate-800">Collision Week</h1>
              <p className="text-slate-500 text-sm">Masuk sebagai pengguna demo</p>
            </div>

            <div className="hidden lg:block mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Masuk ke platform</h2>
              <p className="text-slate-500 text-sm mt-1">Pilih peran dan akun untuk melanjutkan</p>
            </div>

            {/* Role tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 mb-6">
              {(["STUDENT", "LECTURER", "ADMIN"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveTab(role)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === role
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {ROLE_STYLES[role].label}
                </button>
              ))}
            </div>

            {/* Search + count: daftar akun demo panjang, jadi harus bisa dicari */}
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari nama atau email"
                  aria-label="Cari akun"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 focus:bg-white"
                />
              </div>
              <span className="text-[11px] text-slate-400 tabular-nums flex-shrink-0">
                {usersOfRole.length} akun
              </span>
            </div>

            {/* Users list */}
            <div className="space-y-2 mb-6 max-h-[22rem] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : usersOfRole.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  {query.trim()
                    ? `Tidak ada akun yang cocok dengan "${query.trim()}"`
                    : `Tidak ada pengguna ${ROLE_STYLES[activeTab].label}`}
                </div>
              ) : (
                usersOfRole.map((user) => {
                  const isSelected = selectedUser?.id === user.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-indigo-400 bg-indigo-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {/* Avatar */}
                      <UserAvatar
                        src={user.avatarUrl}
                        name={user.name}
                        size="lg"
                        shape="rounded"
                        className={isSelected ? "ring-2 ring-indigo-500" : ""}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                          {user.program?.name && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 flex-shrink-0">
                              {user.program.name}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                            <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {error && (
              <div className="mb-3 rounded-xl border border-semantic-danger-soft bg-semantic-danger-soft/60 px-3 py-2 text-xs text-semantic-danger-fg">
                {error}
              </div>
            )}

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={!selectedUser || isLoggingIn}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                selectedUser && !isLoggingIn
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isLoggingIn
                ? "Memuat..."
                : selectedUser
                ? `Masuk sebagai ${selectedUser.name.split(" ")[0]}`
                : "Pilih akun terlebih dahulu"}
            </button>

            {/* Mobile logos */}
            <div className="lg:hidden mt-6 pt-5 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 text-center mb-3">Platform untuk</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <UniversityLogos layout="row" size="sm" />
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-400 mt-4">
              Ini adalah akun demo. Tidak ada password diperlukan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
