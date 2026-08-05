import { useMemo } from 'react';
import { calcularAfinidad, getAffinityScore, getRango } from '../utils/affinityCalculator';
import type { Arbol, RangoAfinidad } from '../types';

export function useAffinityCalc(arbol: Arbol) {
  const resultado = useMemo(() => calcularAfinidad(arbol), [arbol]);

  const getAffinityPair = (idA: string, idB: string): { puntuacion: number; rango: RangoAfinidad } => {
    if (!idA || !idB) return { puntuacion: 0, rango: '-' };
    const puntuacion = getAffinityScore(idA, idB);
    return { puntuacion, rango: getRango(puntuacion) as RangoAfinidad };
  };

  return { resultado, getAffinityPair };
}
