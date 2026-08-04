import { useMemo } from 'react';
import { calcularAptitud } from '../utils/aptitudCalculator';
import type { Arbol } from '../types';
import type { ResultadoAptitud } from '../utils/aptitudCalculator';

export function useAptitudCalc(arbol: Arbol): ResultadoAptitud {
  return useMemo(() => calcularAptitud(arbol), [arbol]);
}