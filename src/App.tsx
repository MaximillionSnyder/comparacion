import { useState, useEffect, useRef } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import PedigreeTree from './components/tree/PedigreeTree';
import AffinityMatrix from './components/matrix/AffinityMatrix';
import CharacterSelectorModal from './components/modals/CharacterSelectorModal';
import FactorEditorModal from './components/modals/FactorEditorModal';
import { usePedigreeTree } from './hooks/usePedigreeTree';
import { useAffinityCalc } from './hooks/useAffinityCalc';
import { CONFLICT_SLOTS } from './data/pedigreeConfig';
import {
  FACTOR_AZUL_VACIO, FACTOR_ROJO_VACIO, FACTOR_VERDE_VACIO,
  POS_LABELS,
} from './types';
import { getPersonajeNombre } from './utils/characterLabels';
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const modalSelectorRef = useRef(modalSelector);
  const modalFactorRef = useRef(modalFactor);
  const showExitConfirmRef = useRef(showExitConfirm);
  modalSelectorRef.current = modalSelector;
  modalFactorRef.current = modalFactor;
  showExitConfirmRef.current = showExitConfirm;

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = CapApp.addListener('backButton', () => {
      if (modalSelectorRef.current !== null) {
        setModalSelector(null);
        return;
      }
      if (modalFactorRef.current !== null) {
        setModalFactor(null);
        return;
      }
      if (showExitConfirmRef.current) {
        setShowExitConfirm(false);
        return;
      }
      setShowExitConfirm(true);
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

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
          for (const s of CONFLICT_SLOTS[modalSelector]) {
            if (arbol[s].personaje?.id === char.id) clearPersonaje(s);
          }
          setPersonaje(modalSelector, char);
          if (modalSelector === 'objetivo') autoFillFactores('objetivo');
        }}
        posicion={modalSelector ? POS_LABELS[modalSelector] : ''}
        excludeIds={modalSelector
          ? CONFLICT_SLOTS[modalSelector]
            .map((pos) => arbol[pos].personaje?.id)
            .filter((id): id is string => !!id)
          : []}
      />

      <FactorEditorModal
        open={modalFactor !== null}
        onClose={() => setModalFactor(null)}
        posicion={modalFactor!}
        factorAzul={modalFactor ? arbol[modalFactor].factorAzul : FACTOR_AZUL_VACIO}
        factorRojo={modalFactor ? arbol[modalFactor].factorRojo : FACTOR_ROJO_VACIO}
        factorVerde={modalFactor ? arbol[modalFactor].factorVerde : FACTOR_VERDE_VACIO}
        personajeName={modalFactor && arbol[modalFactor].personaje
          ? getPersonajeNombre(arbol[modalFactor].personaje)
          : undefined}
        onSetAzul={(pos, factor) => setFactorAzul(pos, factor)}
        onSetRojo={(pos, factor) => setFactorRojo(pos, factor)}
        onSetVerde={(pos, factor) => setFactorVerde(pos, factor)}
        onAutoFill={(pos) => autoFillFactores(pos)}
      />

      {showExitConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700/80 rounded-2xl w-full max-w-xs p-5 shadow-2xl animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-bold text-white mb-1">¿Salir de la app?</h2>
            <p className="text-xs text-gray-400 mb-4">
              Si sales ahora, la aplicación se cerrará.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold transition-colors min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void CapApp.exitApp()}
                className="flex-1 px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors min-h-[44px]"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
