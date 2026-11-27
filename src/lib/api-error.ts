import { NextResponse } from "next/server";
import { PermissionError } from "./session";

/**
 * Ubah PermissionError menjadi respons JSON yang bisa dibaca UI.
 * 401 = belum masuk, 403 = sudah masuk tapi perannya tidak boleh.
 */
export function toErrorResponse(error: unknown) {
  if (error instanceof PermissionError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN",
        capability: error.capability,
      },
      { status: error.status }
    );
  }
  return null;
}
