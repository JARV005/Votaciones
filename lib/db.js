import { neon } from "@neondatabase/serverless";

import { CELULAS_INICIALES, CLAN_IDS } from "./clanes.js";

let listo = false;

// Devuelve el cliente SQL o null si falta la variable de conexión.
export function conexion() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  return url ? neon(url) : null;
}

// Crea las tablas si faltan y siembra las células iniciales una sola vez.
// La clave primaria en votos.documento es la que impide el segundo voto.
export async function prepararTablas(sql) {
  if (listo) return;
  await sql.transaction([
    sql`CREATE TABLE IF NOT EXISTS votos (
      documento TEXT PRIMARY KEY,
      celula TEXT NOT NULL,
      creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    sql`ALTER TABLE votos ADD COLUMN IF NOT EXISTS clan TEXT`,
    sql`CREATE TABLE IF NOT EXISTS equipos (
      id SERIAL PRIMARY KEY,
      clan TEXT NOT NULL,
      nombre TEXT NOT NULL,
      creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    sql`CREATE UNIQUE INDEX IF NOT EXISTS equipos_clan_nombre ON equipos (clan, lower(nombre))`,
    sql`CREATE TABLE IF NOT EXISTS ajustes (clave TEXT PRIMARY KEY, valor TEXT)`,
    sql`ALTER TABLE votos ADD COLUMN IF NOT EXISTS nombre TEXT`,
    sql`ALTER TABLE equipos ADD COLUMN IF NOT EXISTS finalista BOOLEAN NOT NULL DEFAULT false`,
    // Votación final: la hacen los TL, un voto por documento.
    sql`CREATE TABLE IF NOT EXISTS votos_final (
      documento TEXT PRIMARY KEY,
      clan TEXT NOT NULL,
      celula TEXT NOT NULL,
      creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    sql`ALTER TABLE votos_final ADD COLUMN IF NOT EXISTS nombre TEXT`,
  ]);

  // Solo la primera vez: si el TL luego quita todas las células, no se vuelven a crear.
  const primera = await sql`
    INSERT INTO ajustes (clave, valor) VALUES ('celulas_sembradas', 'si')
    ON CONFLICT (clave) DO NOTHING
    RETURNING clave`;
  if (primera.length > 0) {
    const inserciones = [];
    for (const clan of CLAN_IDS) {
      for (const nombre of CELULAS_INICIALES) {
        inserciones.push(sql`
          INSERT INTO equipos (clan, nombre) VALUES (${clan}, ${nombre})
          ON CONFLICT DO NOTHING`);
      }
    }
    await sql.transaction(inserciones);
  }
  listo = true;
}

export async function listarEquipos(sql, clan) {
  if (clan) {
    return sql`SELECT id, clan, nombre, finalista FROM equipos WHERE clan = ${clan} ORDER BY id`;
  }
  return sql`SELECT id, clan, nombre, finalista FROM equipos ORDER BY id`;
}

// Nombre de la persona que vota: sin espacios repetidos, entre 3 y 80 caracteres.
export function limpiarNombre(valor) {
  const nombre = String(valor ?? "").replace(/\s+/g, " ").trim();
  return nombre.length >= 3 && nombre.length <= 80 ? nombre : null;
}
