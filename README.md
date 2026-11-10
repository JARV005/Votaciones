# Votaciones

Mini aplicación para que los coders voten por la célula ganadora de su clan.

- Cuatro clanes: Ritchie, Nakamoto, Ubuntu y Tesla. Cada clan tiene sus propias células.
- Un voto por número de documento (lo impide la base de datos).
- Cada voto guarda nombre, documento, clan, célula y fecha.
- Panel del TL en `/#tl`, protegido con clave: resultados separados por clan y edición de células (agregar y quitar).
- Final: en el panel se marcan las células finalistas y los TL votan por la ganadora, un voto por documento.

## Links

- Votación con selector de clan: la URL del proyecto.
- Votación directa de un clan: `/?clan=ritchie`, `/?clan=nakamoto`, `/?clan=ubuntu`, `/?clan=tesla`.
- Panel del TL: `/#tl`.

## Estructura

- `index.html`: votación y panel del TL.
- `api/equipos.js`: células de un clan (público).
- `api/votar.js`: registra un voto.
- `api/resultados.js`: votos y células, con clave.
- `api/admin-equipos.js`: agrega o quita células y marca finalistas, con clave.
- `api/final.js`: voto de un TL en la final, con clave.
- `lib/`: conexión a la base de datos, clanes y validación de la clave.

## Despliegue en Vercel

1. Importa este repositorio como proyecto. No requiere configuración de build.
2. En **Storage**, crea una base de datos **Neon (Postgres)** y conéctala. Eso crea `DATABASE_URL`.
3. En **Settings > Environment Variables** agrega `CLAVE_TL`.
4. Haz **Redeploy**.

Las tablas se crean solas en el primer uso. Cada clan arranca con ocho células de ejemplo que se editan desde el panel.

## Reiniciar la votación

En el editor SQL de Neon:

```sql
TRUNCATE votos;
TRUNCATE votos_final;
```
