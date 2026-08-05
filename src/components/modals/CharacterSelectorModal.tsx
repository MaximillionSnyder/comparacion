import { useState, useMemo, useEffect, useRef } from 'react';
import type { Personaje } from '../../types';
import characters from '../../data/characters.json';
import { getPersonajeNombre, getPersonajeSearchText } from '../../utils/characterLabels';

interface CharacterSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (personaje: Personaje) => void;
  posicion: string;
  excludeIds?: string[];
}

const DIST_LABEL: Record<string, string> = {
  sprint: 'Sprint',
  mile: 'Mile',
  medium: 'Medium',
  long: 'Long',
};

const ESTILO_LABEL: Record<string, string> = {
  front: 'Front',
  pace: 'Pace',
  late: 'Late',
  end: 'End',
};

function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export default function CharacterSelectorModal({
  open, onClose, onSelect, posicion, excludeIds = [],
}: CharacterSelectorModalProps) {
  const [search, setSearch] = useState('');
  const [fDistancia, setFDistancia] = useState('');
  const [fEstilo, setFEstilo] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const excludeSet = useMemo(() => new Set(excludeIds), [excludeIds]);

  useEffect(() => {
    if (open) {
      setSearch('');
      setFDistancia('');
      setFEstilo('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    let list = characters as Personaje[];
    if (search) {
      const q = normalizeSearch(search);
      list = list.filter((c) => normalizeSearch(getPersonajeSearchText(c)).includes(q));
    }
    if (fDistancia) list = list.filter((c) => c.distancia === fDistancia);
    if (fEstilo) list = list.filter((c) => c.estilo === fEstilo);
    return list;
  }, [search, fDistancia, fEstilo]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700/80 rounded-t-3xl sm:rounded-2xl w-full sm:w-[480px] max-h-[90vh] sm:max-h-[80vh] flex flex-col shadow-2xl animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-800 shrink-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Seleccionar</p>
              <h2 className="text-lg font-bold text-white">
                Slot: <span className="text-violet-300">{posicion}</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xl leading-none flex items-center justify-center"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          <div className="relative mb-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">⌕</span>
            <input
              ref={inputRef}
              type="search"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={fDistancia}
              onChange={(e) => setFDistancia(e.target.value)}
              className="flex-1 px-2.5 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 text-xs focus:outline-none focus:border-violet-500"
            >
              <option value="">Toda distancia</option>
              <option value="sprint">Sprint</option>
              <option value="mile">Mile</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
            <select
              value={fEstilo}
              onChange={(e) => setFEstilo(e.target.value)}
              className="flex-1 px-2.5 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 text-xs focus:outline-none focus:border-violet-500"
            >
              <option value="">Todo estilo</option>
              <option value="front">Front</option>
              <option value="pace">Pace</option>
              <option value="late">Late</option>
              <option value="end">End</option>
            </select>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">{filtered.length} personaje{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-500 py-12 text-sm">Sin resultados. Prueba otro filtro.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filtered.map((char) => {
                const blocked = excludeSet.has(char.id);
                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => {
                      if (blocked) return;
                      onSelect(char);
                      onClose();
                    }}
                    disabled={blocked}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all text-left border min-h-[64px] ${
                      blocked
                        ? 'bg-gray-950/50 border-red-900/20 opacity-45 cursor-not-allowed'
                        : 'bg-gray-800/70 hover:bg-gray-700 hover:border-violet-500/40 border-gray-700/60 hover:scale-[1.01] active:scale-[0.99]'
                    }`}
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-white/10"
                      style={{ backgroundColor: char.avatarColor }}
                    >
                        {getPersonajeNombre(char).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-white font-semibold truncate">{getPersonajeNombre(char)}</span>
                        {blocked && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 shrink-0">
                            Ocupado
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700/80 text-gray-400">
                          {DIST_LABEL[char.distancia] ?? char.distancia}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700/80 text-gray-400">
                          {ESTILO_LABEL[char.estilo] ?? char.estilo}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
