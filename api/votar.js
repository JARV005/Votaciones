import { CLAN_IDS } from "../lib/clanes.js";
import { conexion, limpiarNombre, prepararTablas } from "../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, motivo: "metodo" });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const documento = String(body.documento ?? "").trim();
  const clan = String(body.clan ?? "");
  const equipoId = Number(body.equipoId);
  const nombre = limpiarNombre(body.nombre);

  if (!nombre || !/^\d{5,12}$/.test(documento) || !CLAN_IDS.includes(clan) || !Number.isInteger(equipoId)) {
    return res.status(400).json({ ok: false, motivo: "datos" });
  }

  const sql = conexion();
  if (!sql) return res.status(503).json({ ok: false, motivo: "sin_servicio" });

  try {
    await prepararTablas(sql);
    const equipo = await sql`
      SELECT nombre FROM equipos WHERE id = ${equipoId} AND clan = ${clan}`;
    if (equipo.length === 0) {
      return res.status(409).json({ ok: false, motivo: "equipo" });
    }
    // Se guarda el nombre de la célula: el voto se conserva aunque luego la quiten.
    const filas = await sql`
      INSERT INTO votos (documento, nombre, clan, celula)
      VALUES (${documento}, ${nombre}, ${clan}, ${equipo[0].nombre})
      ON CONFLICT (documento) DO NOTHING
      RETURNING documento`;
    if (filas.length === 0) {
      return res.status(409).json({ ok: false, motivo: "duplicado" });
    }
    return res.status(200).json({ ok: true, celula: equipo[0].nombre });
  } catch (err) {
    console.error("Error al guardar el voto", err);
    return res.status(500).json({ ok: false, motivo: "error" });
  }
}
