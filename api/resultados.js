import { revisarClave } from "../lib/clave.js";
import { conexion, listarEquipos, prepararTablas } from "../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, motivo: "metodo" });
  }
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const fallo = revisarClave(body.clave);
  if (fallo) return res.status(fallo.estado).json({ ok: false, motivo: fallo.motivo });

  const sql = conexion();
  if (!sql) return res.status(503).json({ ok: false, motivo: "sin_servicio" });

  try {
    await prepararTablas(sql);
    const votos = await sql`
      SELECT documento, nombre, clan, celula, creado_en
      FROM votos
      ORDER BY creado_en DESC`;
    const votosFinal = await sql`
      SELECT documento, nombre, clan, celula, creado_en
      FROM votos_final
      ORDER BY creado_en DESC`;
    const equipos = await listarEquipos(sql);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ok: true, votos, votosFinal, equipos });
  } catch (err) {
    console.error("Error al leer los votos", err);
    return res.status(500).json({ ok: false, motivo: "error" });
  }
}
