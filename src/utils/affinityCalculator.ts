import characters from '../data/characters.json';
import type { Adaptabilidad, Arbol, Personaje, RangoAfinidad, ResultadoAfinidad } from '../types';

const ADAPT_KEYS = Object.keys((characters as Personaje[])[0]?.adaptabilidad ?? {}) as (keyof Adaptabilidad)[];

const PUNTOS_GRUPO_APTITUD = 7;
// La pertenencia real a un grupo de aptitud viene de una tabla oculta del juego
// (succession_relation_member) que no expone la API. Como aproximación, un personaje
// pertenece al grupo si su grado es >= B (índice 5). No es exacto: p. ej. Bourbon (短距離C)
// sí pertenece al grupo según el datamined, pero no lo derivamos de grados.
const APTITUD_MINIMA_GRUPO = 5;
const PUNTOS_DORM = 2;
const PUNTOS_GRADO = 2;
const PUNTOS_GRUPO = 1;
const PUNTOS_ROOM = 2;

const UMBRAL_SOU = 151;
const UMBRAL_MARU = 51;

const personajes = characters as Personaje[];
const porId = new Map(personajes.map((personaje) => [personaje.id, personaje]));

export function getPersonajePorId(id: string): Personaje | undefined {
  return porId.get(id);
}

function enGrupo(personaje: Personaje, key: keyof Adaptabilidad): boolean {
  return (personaje.adaptabilidad[key] ?? 0) >= APTITUD_MINIMA_GRUPO;
}

function mismoDorm(chars: Personaje[]): boolean {
  const dorms = chars.map((c) => c.afinidad?.dorm);
  if (dorms.some((d) => d === undefined || d === 'solo')) return false;
  return new Set(dorms).size === 1;
}

function mismoGrado(chars: Personaje[]): boolean {
  const grados = chars.map((c) => c.afinidad?.grado);
  if (grados.some((g) => g === undefined)) return false;
  return new Set(grados).size === 1;
}

function gruposComunes(chars: Personaje[]): number {
  const primero = chars[0].afinidad?.grupos ?? [];
  return primero.filter((g) => chars.slice(1).every((c) => c.afinidad?.grupos?.includes(g))).length;
}

/** Bonus 共通 de la fórmula real: 寮 +2, 学年 +2, 仲間 +1 c/u. */
function bonusComunes(chars: Personaje[]): number {
  let puntos = 0;
  if (mismoDorm(chars)) puntos += PUNTOS_DORM;
  if (mismoGrado(chars)) puntos += PUNTOS_GRADO;
  puntos += gruposComunes(chars) * PUNTOS_GRUPO;
  return puntos;
}

export function afinidadPar(a: Personaje, b: Personaje): number {
  if (a.id === b.id) return 0;
  let puntos = 0;
  for (const key of ADAPT_KEYS) {
    if (enGrupo(a, key) && enGrupo(b, key)) puntos += PUNTOS_GRUPO_APTITUD;
  }
  puntos += bonusComunes([a, b]);
  if (a.afinidad?.room === b.id || b.afinidad?.room === a.id) puntos += PUNTOS_ROOM;
  return puntos;
}

export function afinidadTriple(a: Personaje, b: Personaje, c: Personaje): number {
  if (a.id === b.id || a.id === c.id || b.id === c.id) return 0;
  let puntos = 0;
  for (const key of ADAPT_KEYS) {
    if (enGrupo(a, key) && enGrupo(b, key) && enGrupo(c, key)) puntos += PUNTOS_GRUPO_APTITUD;
  }
  puntos += bonusComunes([a, b, c]);
  return puntos;
}

export function getAffinityScore(idA: string, idB: string): number {
  const a = porId.get(idA);
  const b = porId.get(idB);
  if (!a) throw new Error(`Personaje desconocido: ${idA}`);
  if (!b) throw new Error(`Personaje desconocido: ${idB}`);
  return afinidadPar(a, b);
}

export function getRango(puntuacion: number): RangoAfinidad {
  if (puntuacion >= UMBRAL_SOU) return '◎';
  if (puntuacion >= UMBRAL_MARU) return '○';
  if (puntuacion > 0) return '△';
  return '-';
}

export function calcularAfinidad(arbol: Arbol): ResultadoAfinidad {
  const vacio = {
    puntuacionTotal: 0,
    rango: '-' as RangoAfinidad,
    detalle: { parejaPadre: 0, parejaMadre: 0, padreMadre: 0, triples: 0 },
  };

  const objetivo = arbol.objetivo.personaje;
  if (!objetivo) return vacio;

  const padre = arbol.padre.personaje;
  const madre = arbol.madre.personaje;

  const parejaPadre = padre ? afinidadPar(objetivo, padre) : 0;
  const parejaMadre = madre ? afinidadPar(objetivo, madre) : 0;
  const padreMadre = padre && madre ? afinidadPar(padre, madre) : 0;

  let triples = 0;
  if (padre) {
    const ap = arbol.abueloPaterno.personaje;
    const bp = arbol.abuelaPaterna.personaje;
    if (ap) triples += afinidadTriple(objetivo, padre, ap);
    if (bp) triples += afinidadTriple(objetivo, padre, bp);
  }
  if (madre) {
    const am = arbol.abueloMaterno.personaje;
    const bm = arbol.abuelaMaterna.personaje;
    if (am) triples += afinidadTriple(objetivo, madre, am);
    if (bm) triples += afinidadTriple(objetivo, madre, bm);
  }

  const puntuacionTotal = parejaPadre + parejaMadre + padreMadre + triples;

  return {
    puntuacionTotal,
    rango: getRango(puntuacionTotal),
    detalle: { parejaPadre, parejaMadre, padreMadre, triples },
  };
}
