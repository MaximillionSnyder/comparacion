# Plan de mejora y escalabilidad

## Objetivo

Preparar Uma Pedigree para crecer de 20 a aproximadamente 100 Umas sin duplicar lógica, romper los cálculos ni tener que migrar los datos cuando se añadan idiomas.

## Alcance de esta fase

- Preparar nombres de Umas en `es`, `en` y `ja`.
- Usar IDs internos estables para categorías.
- Validar automáticamente personajes, factores y matriz de afinidad.
- Persistir el árbol con un formato versionado.
- Corregir la herencia accidental de factores al cambiar una Uma.
- Centralizar conflictos y relaciones del árbol.
- Mejorar búsqueda y filtros para el catálogo ampliado.
- Añadir validaciones al CI.
- Mantener fuera de esta fase los botones y el cambio visible de idioma.

## Categorías canónicas

Las categorías se guardan con estos IDs en inglés:

- Superficie: `turf`, `dirt`.
- Distancia: `sprint`, `mile`, `medium`, `long`.
- Estilo: `front`, `pace`, `late`, `end`.

Los textos visibles podrán traducirse en una fase posterior sin cambiar los cálculos ni los datos.

## Modelo de datos

- Cada Uma tiene un ID único y nombres localizados `es/en/ja`.
- Las categorías usan IDs canónicos, no textos japoneses ni etiquetas de presentación.
- Las habilidades únicas siguen siendo texto editable; no forman parte del selector de categorías en esta fase.
- El árbol persistido guarda IDs y factores, no copias completas de personajes.

## Validación

El proyecto debe incluir `npm run validate-data`, que compruebe:

- IDs únicos y referencias válidas.
- Nombres localizados completos.
- Adaptabilidades y estrellas dentro de los rangos permitidos.
- Categorías válidas.
- Filas y columnas completas de la matriz.
- Valores de afinidad entre 0 y 100.
- Diagonales válidas.

Los datos inválidos deben fallar en CI. No se deben ocultar con un valor por defecto como `30`.

## Matriz de afinidad

La matriz actual no es simétrica, por lo que se conserva como dirigida hasta confirmar la regla exacta del juego. Se validará para que los 100 personajes tengan filas y columnas correctas.

## Persistencia

- Guardar el árbol en almacenamiento local con una versión de esquema.
- Recuperar el árbol al iniciar y descartar de forma segura datos corruptos o IDs eliminados.
- Mantener las preferencias futuras de idioma separadas del árbol.

## Mantenimiento

- Centralizar los conflictos de parentesco en una sola configuración.
- Mantener el selector con búsqueda por nombres localizados, alias e IDs.
- Añadir pruebas para cálculos, conflictos, validación y persistencia.
- Ejecutar lint, validación y build antes de publicar APKs.
- Ignorar keystores y revisar el versionado Android antes de nuevas releases.

## Orden recomendado para añadir las 80 Umas

1. Validar el nuevo formato de datos.
2. Añadir nombres y estadísticas de cada Uma.
3. Añadir y validar sus afinidades.
4. Ejecutar `npm run validate-data`.
5. Ejecutar lint, tests y build.
6. Publicar solo después de que CI pase.

## Fuera de alcance por ahora

- Selector visible de idioma.
- Cambio dinámico de idioma de la interfaz.
- Traducción de nombres de habilidades únicas.
