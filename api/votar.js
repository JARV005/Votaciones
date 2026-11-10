import { CELULA_IDS } from "../lib/celulas.js";
import { conexion, prepararTabla } from "../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, motivo: "metodo" });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const documento = String(body.documento ?? "").trim();
  const celula = String(body.celula ?? "");

  if (!/^\d{5,12}$/.test(documento) || !CELULA_IDS.includes(celula)) {
    return res.status(400).json({ ok: false, motivo: "datos" });
  }

  const sql = conexion();
  if (!sql) return res.status(503).json({ ok: false, motivo: "sin_servicio" });

  try {
    await prepararTabla(sql);
    const filas = await sql`
      INSERT INTO votos (documento, celula)
      VALUES (${documento}, ${celula})
      ON CONFLICT (documento) DO NOTHING
      RETURNING documento`;
    if (filas.length === 0) {
      return res.status(409).json({ ok: false, motivo: "duplicado" });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error al guardar el voto", err);
    return res.status(500).json({ ok: false, motivo: "error" });
  }
}
