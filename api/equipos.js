import { CLAN_IDS } from "../lib/clanes.js";
import { conexion, listarEquipos, prepararTablas } from "../lib/db.js";

// Lista pública de células de un clan, para armar la votación.
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, motivo: "metodo" });
  }
  const clan = String(req.query?.clan ?? "");
  if (!CLAN_IDS.includes(clan)) {
    return res.status(400).json({ ok: false, motivo: "datos" });
  }
  const sql = conexion();
  if (!sql) return res.status(503).json({ ok: false, motivo: "sin_servicio" });
  try {
    await prepararTablas(sql);
    const equipos = await listarEquipos(sql, clan);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ok: true, equipos });
  } catch (err) {
    console.error("Error al leer las células", err);
    return res.status(500).json({ ok: false, motivo: "error" });
  }
}
