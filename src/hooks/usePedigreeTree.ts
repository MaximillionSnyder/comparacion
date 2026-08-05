import { useState, useCallback, useEffect } from 'react';
import type { Arbol, Nodo, PosicionNodo, Personaje, FactorAzul, FactorRojo, FactorVerde } from '../types';
import { FACTOR_AZUL_VACIO, FACTOR_ROJO_VACIO, FACTOR_VERDE_VACIO, POSICIONES_TODAS } from '../types';
import characters from '../data/characters.json';

const STORAGE_KEY = 'uma-pedigree:tree:v1';
const personajesById = new Map((characters as Personaje[]).map((personaje) => [personaje.id, personaje]));

interface PersistedNodo {
  personajeId: string | null;
  factorAzul: FactorAzul;
  factorRojo: FactorRojo;
  factorVerde: FactorVerde;
}

interface PersistedArbol {
  version: 1;
  slots: Partial<Record<PosicionNodo, PersistedNodo>>;
}

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

const cargarArbol = (): Arbol => {
  if (typeof window === 'undefined') return arbolVacio();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return arbolVacio();
    const saved = JSON.parse(raw) as PersistedArbol;
    if (saved.version !== 1 || !saved.slots) return arbolVacio();

    const arbol = arbolVacio();
    for (const pos of POSICIONES_TODAS) {
      const nodoGuardado = saved.slots[pos];
      if (!nodoGuardado?.personajeId) continue;
      const personaje = personajesById.get(nodoGuardado.personajeId);
      if (!personaje) continue;
      arbol[pos] = {
        personaje,
        factorAzul: nodoGuardado.factorAzul ?? { ...personaje.factoresDefault.azul },
        factorRojo: nodoGuardado.factorRojo ?? { ...personaje.factoresDefault.rojo },
        factorVerde: nodoGuardado.factorVerde ?? { ...personaje.factoresDefault.verde },
      };
    }
    return arbol;
  } catch {
    return arbolVacio();
  }
};

const guardarArbol = (arbol: Arbol): void => {
  if (typeof window === 'undefined') return;

  const slots = {} as Partial<Record<PosicionNodo, PersistedNodo>>;
  for (const pos of POSICIONES_TODAS) {
    const nodo = arbol[pos];
    slots[pos] = {
      personajeId: nodo.personaje?.id ?? null,
      factorAzul: nodo.factorAzul,
      factorRojo: nodo.factorRojo,
      factorVerde: nodo.factorVerde,
    };
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, slots }));
};

export function usePedigreeTree() {
  const [arbol, setArbol] = useState<Arbol>(cargarArbol);

  useEffect(() => {
    guardarArbol(arbol);
  }, [arbol]);

  const setPersonaje = useCallback((posicion: PosicionNodo, personaje: Personaje) => {
    setArbol((prev) => ({
      ...prev,
      [posicion]: {
        personaje,
        factorAzul: { ...personaje.factoresDefault.azul },
        factorRojo: { ...personaje.factoresDefault.rojo },
        factorVerde: { ...personaje.factoresDefault.verde },
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
