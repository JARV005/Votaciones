import { CLAN_IDS } from "../lib/clanes.js";
import { revisarClave } from "../lib/clave.js";
import { conexion, listarEquipos, prepararTablas } from "../lib/db.js";

// Agrega o quita células de un clan y marca las finalistas. Solo con la clave del TL.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, motivo: "metodo" });
  }
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const fallo = revisarClave(body.clave);
  if (fallo) return res.status(fallo.estado).json({ ok: false, motivo: fallo.motivo });

  const accion = String(body.accion ?? "");
  const sql = conexion();
  if (!sql) return res.status(503).json({ ok: false, motivo: "sin_servicio" });

  try {
    await prepararTablas(sql);

    if (accion === "agregar") {
      const clan = String(body.clan ?? "");
      const nombre = String(body.nombre ?? "").replace(/\s+/g, " ").trim();
      if (!CLAN_IDS.includes(clan) || nombre.length < 1 || nombre.length > 40) {
        return res.status(400).json({ ok: false, motivo: "datos" });
      }
      const filas = await sql`
        INSERT INTO equipos (clan, nombre) VALUES (${clan}, ${nombre})
        ON CONFLICT DO NOTHING
        RETURNING id`;
      if (filas.length === 0) {
        return res.status(409).json({ ok: false, motivo: "repetido" });
      }
    } else if (accion === "quitar") {
      const id = Number(body.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ ok: false, motivo: "datos" });
      }
      // Los votos ya emitidos guardan el nombre, así que no se pierden.
      await sql`DELETE FROM equipos WHERE id = ${id}`;
    } else if (accion === "limpiar") {
      // Borra los votos de los coders de un clan, o los de la final. No toca las células.
      const clan = String(body.clan ?? "");
      let borrados;
      if (clan === "final") {
        borrados = await sql`DELETE FROM votos_final RETURNING documento`;
      } else if (CLAN_IDS.includes(clan)) {
        borrados = await sql`DELETE FROM votos WHERE clan = ${clan} RETURNING documento`;
      } else {
        return res.status(400).json({ ok: false, motivo: "datos" });
      }
      return res.status(200).json({ ok: true, borrados: borrados.length });
    } else if (accion === "finalista") {
      const id = Number(body.id);
      if (!Number.isInteger(id) || typeof body.valor !== "boolean") {
        return res.status(400).json({ ok: false, motivo: "datos" });
      }
      await sql`UPDATE equipos SET finalista = ${body.valor} WHERE id = ${id}`;
    } else {
      return res.status(400).json({ ok: false, motivo: "datos" });
    }

    const equipos = await listarEquipos(sql);
    return res.status(200).json({ ok: true, equipos });
  } catch (err) {
    console.error("Error al editar las células", err);
    return res.status(500).json({ ok: false, motivo: "error" });
  }
}
