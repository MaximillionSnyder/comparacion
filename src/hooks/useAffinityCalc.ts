import { useMemo } from 'react';
import { calcularAfinidad } from '../utils/affinityCalculator';
import affinityMatrix from '../data/affinityMatrix.json';
import type { Arbol, RangoAfinidad } from '../types';

export function useAffinityCalc(arbol: Arbol) {
  const resultado = useMemo(() => calcularAfinidad(arbol), [arbol]);

  const getAffinityPair = (idA: string, idB: string): { puntuacion: number; rango: RangoAfinidad } => {
    if (!idA || !idB) return { puntuacion: 0, rango: '-' };
    const puntuacion = (affinityMatrix as Record<string, Record<string, number>>)[idA]?.[idB] ?? 30;
    let rango: RangoAfinidad = '△';
    if (puntuacion >= 80) rango = '◎';
    else if (puntuacion >= 50) rango = '○';
    return { puntuacion, rango };
  };

  return { resultado, getAffinityPair };
}
