import type { Arbol, Adaptabilidad, TipoFactorRojo } from '../types';
import { POSICIONES_ABUELOS } from '../types';

export const GRADES = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S'] as const;

export type NivelAptitud = number;

/** Índice del tope alcanzable por factor rojo (la herencia de aptitud no sube hasta S). */
export const INDICE_APTITUD_TOPE = GRADES.indexOf('A');

export const INDICE_GRADO: Record<string, number> = Object.fromEntries(
  GRADES.map((grade, index) => [grade, index]),
);

export interface ResultadoAptitud {
  tipos: TipoAptitudResultado[];
  hayObjetivo: boolean;
}

export interface TipoAptitudResultado {
  tipo: TipoFactorRojo;
  label: string;
  base: NivelAptitud;
  estrellas: number;
  subida: number;
  final: NivelAptitud;
  mejora: boolean;
}

export const MAPA_TIPO_ROJO_A_APTITUD: Record<TipoFactorRojo, keyof Adaptabilidad> = {
  turf: 'turf',
  dirt: 'dirt',
  sprint: 'sprint',
  mile: 'mile',
  medium: 'medium',
  long: 'long',
  front: 'front',
  pace: 'pace',
  late: 'late',
  end: 'end',
};

export const TIPOS_APTITUD: { tipo: TipoFactorRojo; label: string }[] = [
  { tipo: 'turf', label: 'Turf' },
  { tipo: 'dirt', label: 'Dirt' },
  { tipo: 'sprint', label: 'Sprint' },
  { tipo: 'mile', label: 'Mile' },
  { tipo: 'medium', label: 'Medium' },
  { tipo: 'long', label: 'Long' },
  { tipo: 'front', label: 'Front' },
  { tipo: 'pace', label: 'Pace' },
  { tipo: 'late', label: 'Late' },
  { tipo: 'end', label: 'End' },
];

export function getSubida(estrellas: number): number {
  if (estrellas >= 10) return 4;
  if (estrellas >= 7) return 3;
  if (estrellas >= 4) return 2;
  if (estrellas >= 1) return 1;
  return 0;
}

const POSICIONES_HERENCIA = ['padre', 'madre', ...POSICIONES_ABUELOS] as const;

export function calcularAptitud(arbol: Arbol): ResultadoAptitud {
  const objetivo = arbol.objetivo.personaje;
  if (!objetivo) {
    return { tipos: [], hayObjetivo: false };
  }

  const estrellasPorTipo: Record<TipoFactorRojo, number> = {
    turf: 0, dirt: 0, sprint: 0, mile: 0, medium: 0,
    long: 0, front: 0, pace: 0, late: 0, end: 0,
  };

  for (const pos of POSICIONES_HERENCIA) {
    const nodo = arbol[pos];
    if (!nodo.personaje) continue;
    if (nodo.factorRojo.estrellas > 0) {
      estrellasPorTipo[nodo.factorRojo.tipo] += nodo.factorRojo.estrellas;
    }
  }

  const tipos: TipoAptitudResultado[] = TIPOS_APTITUD.map(({ tipo, label }) => {
    const clave = MAPA_TIPO_ROJO_A_APTITUD[tipo];
    const base = objetivo.adaptabilidad[clave] as NivelAptitud;
    const estrellas = estrellasPorTipo[tipo];
    const subida = getSubida(estrellas);
    const final = Math.min(base + subida, INDICE_APTITUD_TOPE) as NivelAptitud;
    return {
      tipo,
      label,
      base,
      estrellas,
      subida,
      final,
      mejora: final > base,
    };
  });

  return { tipos, hayObjetivo: true };
}
