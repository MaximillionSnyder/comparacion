import characters from '../data/characters.json';
import type { Adaptabilidad, Arbol, Personaje, RangoAfinidad, ResultadoAfinidad } from '../types';

const ADAPT_KEYS = Object.keys((characters as Personaje[])[0]?.adaptabilidad ?? {}) as (keyof Adaptabilidad)[];

const PUNTOS_GRUPO_APTITUD = 7;
const APTITUD_MINIMA_GRUPO = 2;

const personajes = characters as Personaje[];
const porId = new Map(personajes.map((personaje) => [personaje.id, personaje]));

export function getPersonajePorId(id: string): Personaje | undefined {
  return porId.get(id);
}

function enGrupo(personaje: Personaje, key: keyof Adaptabilidad): boolean {
  return (personaje.adaptabilidad[key] ?? 0) >= APTITUD_MINIMA_GRUPO;
}

export function afinidadPar(a: Personaje, b: Personaje): number {
  if (a.id === b.id) return 0;
  let puntos = 0;
  for (const key of ADAPT_KEYS) {
    if (enGrupo(a, key) && enGrupo(b, key)) puntos += PUNTOS_GRUPO_APTITUD;
  }
  return puntos;
}

export function afinidadTriple(a: Personaje, b: Personaje, c: Personaje): number {
  if (a.id === b.id || a.id === c.id || b.id === c.id) return 0;
  let puntos = 0;
  for (const key of ADAPT_KEYS) {
    if (enGrupo(a, key) && enGrupo(b, key) && enGrupo(c, key)) puntos += PUNTOS_GRUPO_APTITUD;
  }
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
  if (puntuacion >= 150) return '◎';
  if (puntuacion >= 50) return '○';
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
