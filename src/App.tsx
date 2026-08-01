import { useState, useMemo } from 'react';
import PedigreeTree from './components/tree/PedigreeTree';
import AffinityMatrix from './components/matrix/AffinityMatrix';
import CharacterSelectorModal from './components/modals/CharacterSelectorModal';
import FactorEditorModal from './components/modals/FactorEditorModal';
import { usePedigreeTree } from './hooks/usePedigreeTree';
import { useAffinityCalc } from './hooks/useAffinityCalc';
import {
  FACTOR_AZUL_VACIO, FACTOR_ROJO_VACIO, FACTOR_VERDE_VACIO,
  POSICIONES_TODAS, POS_LABELS,
} from './types';
import type { PosicionNodo } from './types';

function App() {
  const {
    arbol, setPersonaje, setFactorAzul, setFactorRojo, setFactorVerde,
    autoFillFactores, clearPersonaje, clearAll,
  } = usePedigreeTree();
  const { resultado } = useAffinityCalc(arbol);

  const [tab, setTab] = useState<'tree' | 'matrix'>('tree');
  const [modalSelector, setModalSelector] = useState<PosicionNodo | null>(null);
  const [modalFactor, setModalFactor] = useState<PosicionNodo | null>(null);

  const excludeForSlot = useMemo((): Record<PosicionNodo, string[]> => {
    const id = (pos: PosicionNodo) => arbol[pos].personaje?.id;
    const add = (...ids: (string | undefined)[]) =>
      [...new Set(ids.filter((x): x is string => !!x))];

    const obj = id('objetivo');
    const padre = id('padre');
    const madre = id('madre');

    const pair: [PosicionNodo, PosicionNodo][] = [
      ['padre', 'madre'],
      ['abueloPaterno', 'abuelaPaterna'],
      ['abueloMaterno', 'abuelaMaterna'],
      ['bisAbueloPP', 'bisAbuelaPP'],
      ['bisAbueloPM', 'bisAbuelaPM'],
      ['bisAbueloMP', 'bisAbuelaMP'],
      ['bisAbueloMM', 'bisAbuelaMM'],
    ];

    const sameBranchBlock: Record<PosicionNodo, PosicionNodo[]> = {
      objetivo: [],
      padre: ['abueloPaterno', 'abuelaPaterna', 'bisAbueloPP', 'bisAbuelaPP', 'bisAbueloPM', 'bisAbuelaPM'],
      madre: ['abueloMaterno', 'abuelaMaterna', 'bisAbueloMP', 'bisAbuelaMP', 'bisAbueloMM', 'bisAbuelaMM'],
      abueloPaterno: ['padre', 'bisAbueloPP', 'bisAbuelaPP'],
      abuelaPaterna: ['padre', 'bisAbueloPM', 'bisAbuelaPM'],
      abueloMaterno: ['madre', 'bisAbueloMP', 'bisAbuelaMP'],
      abuelaMaterna: ['madre', 'bisAbueloMM', 'bisAbuelaMM'],
      bisAbueloPP: ['abueloPaterno'],
      bisAbuelaPP: ['abueloPaterno'],
      bisAbueloPM: ['abuelaPaterna'],
      bisAbuelaPM: ['abuelaPaterna'],
      bisAbueloMP: ['abueloMaterno'],
      bisAbuelaMP: ['abueloMaterno'],
      bisAbueloMM: ['abuelaMaterna'],
      bisAbuelaMM: ['abuelaMaterna'],
    };

    const result = {} as Record<PosicionNodo, string[]>;

    for (const pos of POSICIONES_TODAS) {
      const blocked: string[] = [];
      for (const [a, b] of pair) {
        if (pos === a && id(b)) blocked.push(id(b)!);
        if (pos === b && id(a)) blocked.push(id(a)!);
      }
      for (const other of sameBranchBlock[pos] ?? []) {
        const oid = id(other);
        if (oid) blocked.push(oid);
      }
      if ((pos === 'padre' || pos === 'madre') && obj) blocked.push(obj);
      if (pos === 'objetivo') {
        if (padre) blocked.push(padre);
        if (madre) blocked.push(madre);
      }
      result[pos] = add(...blocked);
    }

    return result;
  }, [arbol]);

  const conflictSlots = (pos: PosicionNodo): PosicionNodo[] => {
    const pairMap: Partial<Record<PosicionNodo, PosicionNodo>> = {
      padre: 'madre', madre: 'padre',
      abueloPaterno: 'abuelaPaterna', abuelaPaterna: 'abueloPaterno',
      abueloMaterno: 'abuelaMaterna', abuelaMaterna: 'abueloMaterno',
      bisAbueloPP: 'bisAbuelaPP', bisAbuelaPP: 'bisAbueloPP',
      bisAbueloPM: 'bisAbuelaPM', bisAbuelaPM: 'bisAbueloPM',
      bisAbueloMP: 'bisAbuelaMP', bisAbuelaMP: 'bisAbueloMP',
      bisAbueloMM: 'bisAbuelaMM', bisAbuelaMM: 'bisAbueloMM',
    };
    const branch: Record<PosicionNodo, PosicionNodo[]> = {
      objetivo: ['padre', 'madre'],
      padre: ['objetivo', 'madre', 'abueloPaterno', 'abuelaPaterna', 'bisAbueloPP', 'bisAbuelaPP', 'bisAbueloPM', 'bisAbuelaPM'],
      madre: ['objetivo', 'padre', 'abueloMaterno', 'abuelaMaterna', 'bisAbueloMP', 'bisAbuelaMP', 'bisAbueloMM', 'bisAbuelaMM'],
      abueloPaterno: ['padre', 'abuelaPaterna', 'bisAbueloPP', 'bisAbuelaPP'],
      abuelaPaterna: ['padre', 'abueloPaterno', 'bisAbueloPM', 'bisAbuelaPM'],
      abueloMaterno: ['madre', 'abuelaMaterna', 'bisAbueloMP', 'bisAbuelaMP'],
      abuelaMaterna: ['madre', 'abueloMaterno', 'bisAbueloMM', 'bisAbuelaMM'],
      bisAbueloPP: ['abueloPaterno', 'bisAbuelaPP'],
      bisAbuelaPP: ['abueloPaterno', 'bisAbueloPP'],
      bisAbueloPM: ['abuelaPaterna', 'bisAbuelaPM'],
      bisAbuelaPM: ['abuelaPaterna', 'bisAbueloPM'],
      bisAbueloMP: ['abueloMaterno', 'bisAbuelaMP'],
      bisAbuelaMP: ['abueloMaterno', 'bisAbueloMP'],
      bisAbueloMM: ['abuelaMaterna', 'bisAbuelaMM'],
      bisAbuelaMM: ['abuelaMaterna', 'bisAbueloMM'],
    };
    const list = [...(branch[pos] ?? [])];
    if (pairMap[pos]) list.push(pairMap[pos]!);
    return [...new Set(list)];
  };

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm font-black shadow-lg shadow-violet-500/20 shrink-0">
              馬
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold tracking-tight truncate">Uma Pedigree</h1>
              <p className="text-[10px] text-gray-500 hidden sm:block">Planificador de legacies · 相性</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex bg-gray-900/90 rounded-xl p-1 border border-gray-800">
              <button
                type="button"
                onClick={() => setTab('tree')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all min-h-[40px] ${
                  tab === 'tree'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-900/40'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Árbol
              </button>
              <button
                type="button"
                onClick={() => setTab('matrix')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all min-h-[40px] ${
                  tab === 'matrix'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-900/40'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Matriz
              </button>
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all min-h-[40px]"
              title="Limpiar todo el árbol"
            >
              Limpiar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-5 sm:py-6 pb-16">
        {tab === 'tree' && (
          <PedigreeTree
            arbol={arbol}
            rango={resultado.rango}
            detalle={resultado.detalle}
            onSelectSlot={(pos) => setModalSelector(pos)}
            onEditFactor={(pos) => setModalFactor(pos)}
            onClearSlot={clearPersonaje}
          />
        )}

        {tab === 'matrix' && (
          <div className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Matriz de afinidad</h2>
              <p className="text-xs text-gray-500 mt-0.5">Compatibilidad entre el objetivo y cada legacy del árbol</p>
            </div>
            <AffinityMatrix arbol={arbol} />
          </div>
        )}
      </main>

      <CharacterSelectorModal
        open={modalSelector !== null}
        onClose={() => setModalSelector(null)}
        onSelect={(char) => {
          if (!modalSelector) return;
          for (const s of conflictSlots(modalSelector)) {
            if (arbol[s].personaje?.id === char.id) clearPersonaje(s);
          }
          setPersonaje(modalSelector, char);
          if (modalSelector === 'objetivo') autoFillFactores('objetivo');
        }}
        posicion={modalSelector ? POS_LABELS[modalSelector] : ''}
        excludeIds={modalSelector ? (excludeForSlot[modalSelector] || []) : []}
      />

      <FactorEditorModal
        open={modalFactor !== null}
        onClose={() => setModalFactor(null)}
        posicion={modalFactor!}
        factorAzul={modalFactor ? arbol[modalFactor].factorAzul : FACTOR_AZUL_VACIO}
        factorRojo={modalFactor ? arbol[modalFactor].factorRojo : FACTOR_ROJO_VACIO}
        factorVerde={modalFactor ? arbol[modalFactor].factorVerde : FACTOR_VERDE_VACIO}
        personajeName={modalFactor ? arbol[modalFactor].personaje?.nombre : undefined}
        onSetAzul={(pos, factor) => setFactorAzul(pos, factor)}
        onSetRojo={(pos, factor) => setFactorRojo(pos, factor)}
        onSetVerde={(pos, factor) => setFactorVerde(pos, factor)}
        onAutoFill={(pos) => autoFillFactores(pos)}
      />
    </div>
  );
}

export default App;
