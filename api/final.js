import { revisarClave } from "../lib/clave.js";
import { conexion, prepararTablas } from "../lib/db.js";

// Voto de un TL en la final. Requiere la clave del TL y permite un voto por documento.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, motivo: "metodo" });
  }
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const fallo = revisarClave(body.clave);
  if (fallo) return res.status(fallo.estado).json({ ok: false, motivo: fallo.motivo });

  const documento = String(body.documento ?? "").trim();
  const equipoId = Number(body.equipoId);
  if (!/^\d{5,12}$/.test(documento) || !Number.isInteger(equipoId)) {
    return res.status(400).json({ ok: false, motivo: "datos" });
  }

  const sql = conexion();
  if (!sql) return res.status(503).json({ ok: false, motivo: "sin_servicio" });

  try {
    await prepararTablas(sql);
    const equipo = await sql`
      SELECT clan, nombre FROM equipos WHERE id = ${equipoId} AND finalista`;
    if (equipo.length === 0) {
      return res.status(409).json({ ok: false, motivo: "equipo" });
    }
    const filas = await sql`
      INSERT INTO votos_final (documento, clan, celula)
      VALUES (${documento}, ${equipo[0].clan}, ${equipo[0].nombre})
      ON CONFLICT (documento) DO NOTHING
      RETURNING documento`;
    if (filas.length === 0) {
      return res.status(409).json({ ok: false, motivo: "duplicado" });
    }
    const votosFinal = await sql`
      SELECT documento, clan, celula, creado_en
      FROM votos_final
      ORDER BY creado_en DESC`;
    return res.status(200).json({ ok: true, votosFinal });
  } catch (err) {
    console.error("Error al guardar el voto de la final", err);
    return res.status(500).json({ ok: false, motivo: "error" });
  }
}
