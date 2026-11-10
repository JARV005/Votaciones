# Votaciones

Mini aplicación para que los coders voten por la célula ganadora.

- Un voto por número de documento (lo impide la base de datos).
- Cada voto guarda documento, célula y fecha.
- Panel del TL con conteo y registro de votos en `/#tl`, protegido con clave.

## Estructura

- `index.html`: página de votación y panel del TL.
- `api/votar.js`: registra un voto.
- `api/resultados.js`: devuelve los votos si la clave es correcta.
- `lib/`: conexión a la base de datos y lista de células.

## Despliegue en Vercel

1. En Vercel, **Add New > Project** e importa este repositorio. No requiere configuración de build.
2. En el proyecto, abre **Storage**, crea una base de datos **Neon (Postgres)** y conéctala al proyecto. Eso crea la variable `DATABASE_URL`.
3. En **Settings > Environment Variables** agrega `CLAVE_TL` con la clave que usarás para ver los resultados.
4. Haz **Redeploy** para que tome las variables.

La tabla `votos` se crea sola con el primer voto.

## Uso

- Link para los coders: la URL del proyecto.
- Panel del TL: la misma URL terminada en `/#tl`.

## Reiniciar la votación

En el editor SQL de Neon:

```sql
TRUNCATE votos;
```
