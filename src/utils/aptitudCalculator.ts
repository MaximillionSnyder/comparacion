import type { Arbol, Adaptabilidad, TipoFactorRojo } from '../types';
import { POSICIONES_ABUELOS } from '../types';

export const GRADES = ['G', 'F', 'C', 'A'] as const;

export type NivelAptitud = 0 | 1 | 2 | 3;

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
  '芝': 'turf',
  'ダート': 'dirt',
  '短距離': 'short',
  'マイル': 'mile',
  '中距離': 'medium',
  '長距離': 'long',
  '逃げ': 'leader',
  '先行': 'frontrunner',
  '差し': 'betweener',
  '追込': 'chaser',
};

export const TIPOS_APTITUD: { tipo: TipoFactorRojo; label: string }[] = [
  { tipo: '芝', label: '芝 (Turf)' },
  { tipo: 'ダート', label: 'ダート (Dirt)' },
  { tipo: '短距離', label: '短距離 (Short)' },
  { tipo: 'マイル', label: 'マイル (Mile)' },
  { tipo: '中距離', label: '中距離 (Medium)' },
  { tipo: '長距離', label: '長距離 (Long)' },
  { tipo: '逃げ', label: '逃げ (Leader)' },
  { tipo: '先行', label: '先行 (Frontrunner)' },
  { tipo: '差し', label: '差し (Betweener)' },
  { tipo: '追込', label: '追込 (Chaser)' },
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
    '芝': 0, 'ダート': 0, '短距離': 0, 'マイル': 0, '中距離': 0,
    '長距離': 0, '逃げ': 0, '先行': 0, '差し': 0, '追込': 0,
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
    const final = Math.min(base + subida, 3) as NivelAptitud;
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
