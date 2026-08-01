import { useState, useCallback } from 'react';
import type { Arbol, Nodo, PosicionNodo, Personaje, FactorAzul, FactorRojo, FactorVerde } from '../types';
import { FACTOR_AZUL_VACIO, FACTOR_ROJO_VACIO, FACTOR_VERDE_VACIO, POSICIONES_TODAS } from '../types';

const nodoVacio = (): Nodo => ({
  personaje: null,
  factorAzul: { ...FACTOR_AZUL_VACIO },
  factorRojo: { ...FACTOR_ROJO_VACIO },
  factorVerde: { ...FACTOR_VERDE_VACIO },
});

const arbolVacio = (): Arbol => {
  const a = {} as Arbol;
  for (const pos of POSICIONES_TODAS) {
    a[pos] = nodoVacio();
  }
  return a;
};

export function usePedigreeTree() {
  const [arbol, setArbol] = useState<Arbol>(arbolVacio);

  const setPersonaje = useCallback((posicion: PosicionNodo, personaje: Personaje) => {
    setArbol((prev) => ({
      ...prev,
      [posicion]: {
        personaje,
        factorAzul: { ...prev[posicion].factorAzul },
        factorRojo: { ...prev[posicion].factorRojo },
        factorVerde: { ...prev[posicion].factorVerde },
      },
    }));
  }, []);

  const setFactorAzul = useCallback(
    (posicion: PosicionNodo, factor: FactorAzul) => {
      setArbol((prev) => ({
        ...prev,
        [posicion]: { ...prev[posicion], factorAzul: factor },
      }));
    },
    []
  );

  const setFactorRojo = useCallback(
    (posicion: PosicionNodo, factor: FactorRojo) => {
      setArbol((prev) => ({
        ...prev,
        [posicion]: { ...prev[posicion], factorRojo: factor },
      }));
    },
    []
  );

  const setFactorVerde = useCallback(
    (posicion: PosicionNodo, factor: FactorVerde) => {
      setArbol((prev) => ({
        ...prev,
        [posicion]: { ...prev[posicion], factorVerde: factor },
      }));
    },
    []
  );

  const autoFillFactores = useCallback(
    (posicion: PosicionNodo) => {
      setArbol((prev) => {
        const personaje = prev[posicion].personaje;
        if (!personaje) return prev;
        const def = personaje.factoresDefault;
        return {
          ...prev,
          [posicion]: { ...prev[posicion], factorAzul: { ...def.azul }, factorRojo: { ...def.rojo }, factorVerde: { ...def.verde } },
        };
      });
    },
    []
  );

  const clearPersonaje = useCallback((posicion: PosicionNodo) => {
    setArbol((prev) => ({
      ...prev,
      [posicion]: nodoVacio(),
    }));
  }, []);

  const clearAll = useCallback(() => {
    setArbol(arbolVacio());
  }, []);

  return { arbol, setPersonaje, setFactorAzul, setFactorRojo, setFactorVerde, autoFillFactores, clearPersonaje, clearAll };
}
