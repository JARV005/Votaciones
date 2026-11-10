import { neon } from "@neondatabase/serverless";

let listo = false;

// Devuelve el cliente SQL o null si falta la variable de conexión.
export function conexion() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  return url ? neon(url) : null;
}

// La clave primaria en "documento" es la que impide el segundo voto.
export async function prepararTabla(sql) {
  if (listo) return;
  await sql`
    CREATE TABLE IF NOT EXISTS votos (
      documento TEXT PRIMARY KEY,
      celula TEXT NOT NULL,
      creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  listo = true;
}
