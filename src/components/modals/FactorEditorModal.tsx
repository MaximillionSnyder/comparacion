import { useState, useEffect } from 'react';
import {
  TIPOS_AZUL, TIPOS_ROJO, POS_LABELS,
  type FactorAzul, type FactorRojo, type FactorVerde,
  type TipoFactorAzul, type TipoFactorRojo, type PosicionNodo,
} from '../../types';

interface FactorEditorModalProps {
  open: boolean;
  onClose: () => void;
  posicion: PosicionNodo;
  factorAzul: FactorAzul;
  factorRojo: FactorRojo;
  factorVerde: FactorVerde;
  onSetAzul: (posicion: PosicionNodo, factor: FactorAzul) => void;
  onSetRojo: (posicion: PosicionNodo, factor: FactorRojo) => void;
  onSetVerde: (posicion: PosicionNodo, factor: FactorVerde) => void;
  onAutoFill: (posicion: PosicionNodo) => void;
  personajeName?: string;
}

function StarRow({
  value, color, onChange,
}: {
  value: 0 | 1 | 2 | 3;
  color: 'blue' | 'red' | 'green';
  onChange: (s: 0 | 1 | 2 | 3) => void;
}) {
  const active = {
    blue: 'bg-blue-500 text-white shadow-blue-500/30',
    red: 'bg-rose-500 text-white shadow-rose-500/30',
    green: 'bg-emerald-500 text-white shadow-emerald-500/30',
  }[color];
  const ring = {
    blue: 'ring-blue-300/40',
    red: 'ring-rose-300/40',
    green: 'ring-emerald-300/40',
  }[color];

  return (
    <div className="flex gap-2">
      {([0, 1, 2, 3] as const).map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md min-h-[44px] ${
            value >= s && s > 0 ? active : value === 0 && s === 0 ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 text-gray-600'
          } ${value === s ? `ring-2 ${ring} scale-[1.03]` : ''}`}
        >
          {s === 0 ? '0★' : '★'.repeat(s)}
        </button>
      ))}
    </div>
  );
}

export default function FactorEditorModal({
  open, onClose, posicion,
  factorAzul, factorRojo, factorVerde,
  onSetAzul, onSetRojo, onSetVerde,
  onAutoFill, personajeName,
}: FactorEditorModalProps) {
  const [verdeNombreLocal, setVerdeNombreLocal] = useState(factorVerde.nombre);

  useEffect(() => {
    if (open) setVerdeNombreLocal(factorVerde.nombre);
  }, [open, factorVerde.nombre]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700/80 rounded-t-3xl sm:rounded-2xl w-full sm:w-[440px] max-h-[90vh] flex flex-col shadow-2xl animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-800 shrink-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Factores · Sparks</p>
              <h2 className="text-lg font-bold text-white">
                {POS_LABELS[posicion]}
                {personajeName && (
                  <span className="text-violet-300 font-semibold"> · {personajeName}</span>
                )}
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
          {personajeName && (
            <button
              type="button"
              onClick={() => onAutoFill(posicion)}
              className="mt-2 w-full text-sm px-3 py-2.5 rounded-xl bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 font-semibold transition-colors min-h-[44px]"
            >
              ⚡ Auto-completar desde personaje
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <section className="p-3.5 rounded-2xl border border-blue-500/25 bg-blue-500/5">
            <h3 className="text-sm font-bold text-blue-300 mb-1">Azul · Stat (青)</h3>
            <p className="text-[10px] text-blue-300/50 mb-2">Speed / Stamina / Power / Guts / Wit</p>
            <select
              value={factorAzul.tipo}
              onChange={(e) => onSetAzul(posicion, { ...factorAzul, tipo: e.target.value as TipoFactorAzul })}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm mb-2 focus:outline-none focus:border-blue-500 min-h-[44px]"
            >
              {TIPOS_AZUL.map((t) => (
                <option key={t.tipo} value={t.tipo}>{t.label}</option>
              ))}
            </select>
            <StarRow
              value={factorAzul.estrellas}
              color="blue"
              onChange={(s) => onSetAzul(posicion, { ...factorAzul, estrellas: s })}
            />
          </section>

          <section className="p-3.5 rounded-2xl border border-rose-500/25 bg-rose-500/5">
            <h3 className="text-sm font-bold text-rose-300 mb-1">Rojo · Aptitud (赤)</h3>
            <p className="text-[10px] text-rose-300/50 mb-2">Superficie · Distancia · Estilo</p>
            <select
              value={factorRojo.tipo}
              onChange={(e) => onSetRojo(posicion, { ...factorRojo, tipo: e.target.value as TipoFactorRojo })}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm mb-2 focus:outline-none focus:border-rose-500 min-h-[44px]"
            >
              {TIPOS_ROJO.map((t) => (
                <option key={t.tipo} value={t.tipo}>{t.label}</option>
              ))}
            </select>
            <StarRow
              value={factorRojo.estrellas}
              color="red"
              onChange={(s) => onSetRojo(posicion, { ...factorRojo, estrellas: s })}
            />
          </section>

          <section className="p-3.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5">
            <h3 className="text-sm font-bold text-emerald-300 mb-1">Verde · Unique (緑)</h3>
            <p className="text-[10px] text-emerald-300/50 mb-2">Habilidad única del personaje</p>
            <input
              type="text"
              value={verdeNombreLocal}
              onChange={(e) => setVerdeNombreLocal(e.target.value)}
              onBlur={() => onSetVerde(posicion, { nombre: verdeNombreLocal, estrellas: factorVerde.estrellas })}
              placeholder="Nombre de la habilidad..."
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm mb-2 focus:outline-none focus:border-emerald-500 placeholder-gray-500 min-h-[44px]"
            />
            <StarRow
              value={factorVerde.estrellas}
              color="green"
              onChange={(s) => onSetVerde(posicion, { nombre: verdeNombreLocal, estrellas: s })}
            />
          </section>
        </div>

        <div className="p-4 border-t border-gray-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold transition-colors min-h-[48px]"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
