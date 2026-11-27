/**
 * Sesi server-side.
 *
 * Kenapa cookie bertanda tangan, bukan localStorage:
 * sebelumnya peran pengguna hidup di localStorage dan dikirim ulang oleh klien
 * (`requesterId`, `helperId` di body request). Artinya siapa pun bisa mengaku
 * admin dengan mengubah satu nilai di browser. Sekarang identitas disimpan di
 * cookie httpOnly yang ditandatangani HMAC, dan peran selalu dibaca ulang dari
 * database pada setiap permintaan.
 *
 * Ini autentikasi demo (tanpa password) tetapi otorisasinya nyata: klien tidak
 * bisa memalsukan peran, dan setiap route memeriksa capability sebelum menulis.
 */
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";
import {
  can,
  capabilitiesOf,
  normalizeRole,
  CAPABILITY_REASON,
  type Capability,
  type Role,
} from "./permissions";

export const SESSION_COOKIE = "cw_session";
const MAX_AGE_SECONDS = 60 * 60 * 12;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  programId: string;
  avatarUrl: string | null;
  program?: {
    id: string;
    code: string;
    name: string;
  };
}

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (value && value.length >= 16) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET wajib diisi (minimal 16 karakter) di production. Tanpa itu cookie sesi bisa dipalsukan."
    );
  }
  return "collision-week-dev-secret-do-not-use-in-production";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

function verifyToken(token: string | undefined): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const userId = token.slice(0, dot);
  const given = token.slice(dot + 1);
  const expected = sign(userId);
  if (given.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(given), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return userId;
}

/** Baca sesi aktif. Tidak pernah menerima peran dari klien. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const userId = verifyToken(cookies().get(SESSION_COOKIE)?.value);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      programId: true,
      avatarUrl: true,
      program: { select: { id: true, code: true, name: true } },
    },
  });
  if (!user) return null;

  return { ...user, role: normalizeRole(user.role) };
}

/**
 * Opsi cookie sesi.
 *
 * `secure` ditentukan dari skema permintaan, bukan dari NODE_ENV. Kalau dipaksa
 * `true` di production, aplikasi yang disajikan lewat http biasa (mis. `next
 * start` lokal, atau di belakang proxy yang belum dipasangi TLS) akan menerima
 * Set-Cookie yang tidak pernah dikirim balik oleh browser. Akibatnya pengguna
 * berhasil "masuk" tetapi langsung ditendang ke /login lagi.
 *
 * Jadi: secure hanya kalau permintaannya memang https, atau kalau dipaksa lewat
 * SESSION_COOKIE_SECURE=true (mis. di belakang TLS terminator).
 */
export function sessionCookieOptions(req?: Request) {
  const forced = process.env.SESSION_COOKIE_SECURE === "true";
  const forwarded = req?.headers.get("x-forwarded-proto");
  const isHttps = forwarded
    ? forwarded.split(",")[0].trim() === "https"
    : req?.url
    ? req.url.startsWith("https://")
    : process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: forced || isHttps,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

export class PermissionError extends Error {
  status: number;
  capability: Capability;
  constructor(message: string, status: number, capability: Capability) {
    super(message);
    this.status = status;
    this.capability = capability;
  }
}

export interface Authorized {
  user: SessionUser;
  capabilities: Capability[];
  can: (capability: Capability) => boolean;
}

/**
 * Gerbang untuk route handler. Melempar PermissionError kalau ditolak,
 * jadi pemanggil bisa menangkapnya dan mengembalikan respons yang jelas.
 */
export async function requireCapability(capability: Capability): Promise<Authorized> {
  const user = await getSessionUser();
  if (!user) {
    throw new PermissionError(
      "Sesi tidak ditemukan. Silakan masuk terlebih dahulu.",
      401,
      capability
    );
  }
  if (!can(user.role, capability)) {
    throw new PermissionError(CAPABILITY_REASON[capability], 403, capability);
  }
  return {
    user,
    capabilities: capabilitiesOf(user.role),
    can: (cap) => can(user.role, cap),
  };
}
