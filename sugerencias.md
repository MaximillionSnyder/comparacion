# Sugerencias para mejorar la Matriz de afinidad

Mejoras de usabilidad para el componente `AffinityMatrix` en `src/components/matrix/AffinityMatrix.tsx`.

---

## 1. Leyenda de colores y rangos

Añadir una barra de leyenda debajo de la tabla que explique:

- El significado de cada color (gris = 0, naranja = baja, ámbar = media, verde = alta)
- Los umbrales de rango: ◎ ≥ 151 · ○ ≥ 51 · △ < 51
- El significado de `—` (sin afinidad / auto-comparación)

**Prioridad:** Alta. Sin leyenda, el usuario no puede interpretar los colores sin leer la documentación externa.

---

## 2. Rangos (◎ ○ △) en cada celda

Mostrar el símbolo de rango junto al número de afinidad en cada celda. El número da el valor exacto; el símbolo da contexto instantáneo.

Ejemplo: `42 ○` en vez de solo `42`.

**Prioridad:** Alta. Complementa la leyenda y reduce la carga cognitiva.

---

## 3. Tooltips al pasar el cursor

Al hover sobre una celda, mostrar un tooltip con:

- Nombre de los dos personajes comparados
- Puntuación exacta y rango
- Desglose breve: cuántas afinidades compartidas, bonus de dormitorio/curso/grupo, etc.

**Prioridad:** Media. Requiere exponer el desglose desde `affinityCalculator.ts`.

---

## 4. Barra de resumen sobre la matriz

Una barra con información clave encima de la tabla, similar al patrón de `PedigreeTree.tsx`:

- Puntuación total y rango del árbol actual
- Mejor combinación (par con mayor afinidad)
- Número de pares de alta afinidad (≥ 35)

**Prioridad:** Media. Da contexto inmediato sin necesidad de leer la tabla entera.

---

## 5. Resaltar la mejor combinación

La celda con la puntuación más alta de la matriz recibe un borde brillante o glow para que el ojo del usuario vaya directo a ella.

**Prioridad:** Alta. Es el cambio más visual y de mayor impacto.

---

## 6. Manejo de la diagonal (auto-comparación)

Las celdas de la diagonal (personaje vs. sí mismo) siempre valen 0. En vez de mostrar `0`, mostrar `—` o un icono especial para dejar claro que es una auto-comparación, no una falta de afinidad.

**Prioridad:** Baja. Mejora la claridad visual pero no cambia la funcionalidad.

---

## 7. Celdas responsivas en pantallas pequeñas

En pantallas muy estrechas, reducir el padding y tamaño de fuente de las celdas. Considerar también una vista de "tarjetas" alternativa donde cada par se muestre como una tarjeta apilable.

**Prioridad:** Baja. El scroll horizontal actual ya funciona, pero la experiencia en móvil podría mejorar.

---

## Resumen de prioridades

| # | Sugerencia | Prioridad |
|---|-----------|-----------|
| 1 | Leyenda de colores y rangos | Alta |
| 2 | Rangos en celdas | Alta |
| 3 | Tooltips con desglose | Media |
| 4 | Barra de resumen | Media |
| 5 | Resaltar mejor combinación | Alta |
| 6 | Diagonal con `—` | Baja |
| 7 | Responsividad | Baja |