/**
 * Satu-satunya sumber kebenaran untuk otorisasi.
 *
 * Dipakai di dua sisi:
 *  - server (route handler) lewat `requireCapability` di lib/session.ts
 *  - client (UI) lewat `useSession().can(...)`
 *
 * Aturannya: UI hanya menyembunyikan, server yang menolak. Kalau sebuah
 * capability tidak ada di matriks ini, tidak ada yang boleh melakukannya.
 */

export type Role = "STUDENT" | "LECTURER" | "ADMIN";

export const ROLES: Role[] = ["STUDENT", "LECTURER", "ADMIN"];

export type Capability =
  // navigasi / baca
  | "dashboard.view"
  | "week.view"
  | "help.view"
  | "analytics.view"
  | "import.view"
  // bantuan sebaya
  | "help.create"
  | "help.respond"
  | "help.resolve.own"
  | "help.resolve.any"
  // penjadwalan
  | "schedule.move"
  | "schedule.import"
  // administrasi
  | "users.list"
  | "demo.reset";

const STUDENT: Capability[] = [
  "dashboard.view",
  "week.view",
  "help.view",
  "help.create",
  "help.respond",
  "help.resolve.own",
];

const LECTURER: Capability[] = [
  ...STUDENT,
  "analytics.view",
  "import.view",
  "schedule.import",
  "schedule.move",
  "help.resolve.any",
  "users.list",
];

const ADMIN: Capability[] = [...LECTURER, "demo.reset"];

const MATRIX: Record<Role, ReadonlySet<Capability>> = {
  STUDENT: new Set(STUDENT),
  LECTURER: new Set(LECTURER),
  ADMIN: new Set(ADMIN),
};

export function normalizeRole(value: string | null | undefined): Role {
  const upper = (value || "").toUpperCase();
  return (ROLES as string[]).includes(upper) ? (upper as Role) : "STUDENT";
}

export function can(role: Role | string | null | undefined, capability: Capability): boolean {
  return MATRIX[normalizeRole(role as string)].has(capability);
}

export function capabilitiesOf(role: Role | string | null | undefined): Capability[] {
  return Array.from(MATRIX[normalizeRole(role as string)]);
}

export const ROLE_LABEL: Record<Role, string> = {
  STUDENT: "Mahasiswa",
  LECTURER: "Dosen",
  ADMIN: "Admin",
};

/** Alasan yang ditampilkan ke pengguna saat sebuah aksi ditolak. */
export const CAPABILITY_REASON: Record<Capability, string> = {
  "dashboard.view": "Semua peran dapat membuka peta beban.",
  "week.view": "Semua peran dapat membuka detail pekan.",
  "help.view": "Semua peran dapat membaca papan bantuan.",
  "analytics.view": "Analitik sub-topik hanya untuk dosen dan admin.",
  "import.view": "Impor jadwal hanya untuk dosen dan admin.",
  "help.create": "Semua peran dapat mengajukan pertanyaan.",
  "help.respond": "Semua peran dapat menanggapi pertanyaan.",
  "help.resolve.own": "Penanya boleh menandai pertanyaannya sendiri selesai.",
  "help.resolve.any": "Hanya dosen dan admin yang boleh menutup pertanyaan siapa pun.",
  "schedule.move": "Menggeser tanggal tugas mengubah jadwal kelas, jadi hanya dosen dan admin.",
  "schedule.import": "Mengimpor CSV menulis ulang seluruh jadwal, jadi hanya dosen dan admin.",
  "users.list": "Daftar akun hanya untuk dosen dan admin.",
  "demo.reset": "Mengatur ulang data demo hanya untuk admin.",
};

/** Rute yang hanya boleh dibuka peran tertentu. */
export const ROUTE_CAPABILITY: Record<string, Capability> = {
  "/analytics": "analytics.view",
  "/import": "import.view",
};

export function capabilityForPath(pathname: string): Capability | null {
  const match = Object.keys(ROUTE_CAPABILITY).find(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  return match ? ROUTE_CAPABILITY[match] : null;
}
