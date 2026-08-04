# Uma Pedigree

Construye árboles genealógicos de personajes de **Uma Musume** y calcula la afinidad (相性) entre ellos, tal como la mecánica de cría del juego.

> Inspirado en la planificación de *legacies*: arma el pedigree completo (hasta bisabuelos), ajusta factores 青·赤·緑 y obtén la compatibilidad al instante.

## Características

- **Árbol genealógico** interactivo de 15 slots: objetivo → padres → abuelos → bisabuelos
- **Editor de factores** con relleno automático (Azul 青, Rojo 赤, Verde 緑)
- **Matriz de afinidad** con rangos ◎ ○ △ y detalle de puntuación en tiempo real
- Detección de conflictos de parentesco al seleccionar personajes
- Disponible como **web** y como **app Android** (Capacitor)

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Capacitor 8

## Desarrollo

```bash
npm install
npm run dev     # servidor local
npm run build   # build de producción (dist/)
npm run lint    # lint
```

## App Android

Los APK firmados se publican automáticamente como **GitHub Release** al crear una tag:

```bash
git tag v1.0.0 && git push origin v1.0.0
```

Descarga e instala el APK desde la sección **Releases** del repositorio.

## Licencia

MIT
