"use client";

/**
 * Sesi di sisi klien.
 *
 * Sebelumnya peran hidup di localStorage dan bisa diubah dari DevTools, jadi
 * mahasiswa bisa mengaku dosen. Sekarang satu-satunya sumber identitas adalah
 * cookie httpOnly yang ditandatangani server (lihat lib/session.ts). Konteks ini
 * hanya mencerminkan sesi itu dan menyediakan `can()` untuk menyembunyikan aksi.
 *
 * `can()` di sini kosmetik. Penolakan yang sebenarnya terjadi di route handler.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { UserProfile, UserRole } from "@/lib/types";
import { can as canRole, capabilitiesOf, type Capability } from "@/lib/permissions";

interface SessionContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  role: UserRole;
  isLoading: boolean;
  capabilities: Capability[];
  can: (capability: Capability) => boolean;
  login: (userId: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/accounts", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Gagal memuat daftar akun:", err);
    }
  }, []);

  const loadSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user ?? null);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Gagal memuat sesi:", err);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
    refreshUsers();
  }, [loadSession, refreshUsers]);

  const login = useCallback(async (userId: string) => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, error: data.error || "Gagal masuk." };
      }
      setCurrentUser(data.user);
      return { ok: true };
    } catch {
      return { ok: false, error: "Koneksi gagal saat masuk." };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {
      // abaikan: cookie tetap dibersihkan pada permintaan berikutnya
    }
    setCurrentUser(null);
  }, []);

  const role: UserRole = currentUser?.role || "STUDENT";

  const value = useMemo<SessionContextType>(
    () => ({
      currentUser,
      users,
      role,
      isLoading,
      capabilities: capabilitiesOf(role),
      can: (capability: Capability) => canRole(role, capability),
      login,
      logout,
      refreshUsers,
    }),
    [currentUser, users, role, isLoading, login, logout, refreshUsers]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useRole() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useRole harus dipakai di dalam RoleProvider");
  }
  return context;
}

/** Alias yang lebih jujur untuk konteks ini. */
export const useSession = useRole;
