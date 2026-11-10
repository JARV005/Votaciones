import { timingSafeEqual } from "node:crypto";

import { conexion, prepararTabla } from "../lib/db.js";

function claveCorrecta(recibida, esperada) {
  const a = Buffer.from(recibida);
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, motivo: "metodo" });
  }

  // La clave del TL vive solo en la variable de entorno CLAVE_TL.
  const esperada = process.env.CLAVE_TL;
  if (!esperada) return res.status(503).json({ ok: false, motivo: "sin_clave" });

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const clave = String(body.clave ?? "");
  if (!clave || !claveCorrecta(clave, esperada)) {
    return res.status(401).json({ ok: false, motivo: "clave" });
  }

  const sql = conexion();
  if (!sql) return res.status(503).json({ ok: false, motivo: "sin_servicio" });

  try {
    await prepararTabla(sql);
    const votos = await sql`
      SELECT documento, celula, creado_en
      FROM votos
      ORDER BY creado_en DESC`;
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ok: true, votos });
  } catch (err) {
    console.error("Error al leer los votos", err);
    return res.status(500).json({ ok: false, motivo: "error" });
  }
}
