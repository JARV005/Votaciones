import { timingSafeEqual } from "node:crypto";

// Valida la clave del TL contra la variable de entorno CLAVE_TL.
// Devuelve null si es correcta, o { estado, motivo } con el error a responder.
export function revisarClave(recibida) {
  const esperada = process.env.CLAVE_TL;
  if (!esperada) return { estado: 503, motivo: "sin_clave" };
  const a = Buffer.from(String(recibida ?? ""));
  const b = Buffer.from(esperada);
  if (a.length === 0 || a.length !== b.length || !timingSafeEqual(a, b)) {
    return { estado: 401, motivo: "clave" };
  }
  return null;
}
