import { useState } from 'react';
import CharacterCard from './CharacterCard';
import AptitudPanel from './AptitudPanel';
import { POSICIONES_BISABUELOS } from '../../types';
import type { Arbol, PosicionNodo } from '../../types';

interface PedigreeTreeProps {
  arbol: Arbol;
  rango: string;
  detalle: { base: number; bonusPadres: number; bonusAbuelos: number; bonusFactores: number };
  onSelectSlot: (posicion: PosicionNodo) => void;
  onEditFactor: (posicion: PosicionNodo) => void;
  onClearSlot: (posicion: PosicionNodo) => void;
}

function Card(props: {
  arbol: Arbol;
  pos: PosicionNodo;
  label: string;
  compact?: boolean;
  highlight?: 'paternal' | 'maternal' | 'target';
  onSelectSlot: (posicion: PosicionNodo) => void;
  onEditFactor: (posicion: PosicionNodo) => void;
  onClearSlot: (posicion: PosicionNodo) => void;
}) {
  return (
    <CharacterCard
      nodo={props.arbol[props.pos]}
      posicion={props.pos}
      label={props.label}
      compact={props.compact}
      highlight={props.highlight}
      onSelect={props.onSelectSlot}
      onEditFactor={props.onEditFactor}
      onClear={props.onClearSlot}
    />
  );
}

function Connector() {
  return (
    <div className="flex flex-col items-center py-1" aria-hidden>
      <div className="w-px h-5 bg-gradient-to-b from-gray-600 to-gray-700" />
      <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
      <div className="w-px h-5 bg-gradient-to-b from-gray-700 to-gray-600" />
    </div>
  );
}

function GenLabel({ children, tone }: { children: string; tone?: 'sky' | 'pink' | 'violet' }) {
  const colors = {
    sky: 'text-sky-400/90 bg-sky-500/10 border-sky-500/20',
    pink: 'text-pink-400/90 bg-pink-500/10 border-pink-500/20',
    violet: 'text-violet-300 bg-violet-500/10 border-violet-500/25',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${colors[tone ?? 'violet']}`}>
      {children}
    </span>
  );
}

export default function PedigreeTree({
  arbol, rango, detalle, onSelectSlot, onEditFactor, onClearSlot,
}: PedigreeTreeProps) {
  const [bisabuelosExpanded, setBisabuelosExpanded] = useState(false);

  const filledBis = POSICIONES_BISABUELOS.filter((pos) => arbol[pos].personaje).length;

  const rangoStyle =
    rango === '◎'
      ? 'text-amber-300 bg-amber-500/15 border-amber-400/40 shadow-amber-500/20'
      : rango === '○'
        ? 'text-orange-300 bg-orange-500/15 border-orange-400/40'
        : rango === '△'
          ? 'text-gray-300 bg-gray-500/15 border-gray-500/40'
          : 'text-gray-500 bg-gray-800/50 border-gray-700';

  const p = { arbol, onSelectSlot, onEditFactor, onClearSlot };
  const filled =
    (arbol.padre.personaje ? 1 : 0) +
    (arbol.madre.personaje ? 1 : 0) +
    (arbol.abueloPaterno.personaje ? 1 : 0) +
    (arbol.abuelaPaterna.personaje ? 1 : 0) +
    (arbol.abueloMaterno.personaje ? 1 : 0) +
    (arbol.abuelaMaterna.personaje ? 1 : 0);

  return (
    <div className="w-full animate-fade-in">
      {/* Score bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border shadow-lg ${rangoStyle}`}>
          <span className="text-4xl font-black leading-none">{rango === '-' ? '—' : rango}</span>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider opacity-70">Afinidad</div>
            <div className="text-sm font-bold tabular-nums">Total {detalle.base + detalle.bonusFactores}</div>
          </div>
        </div>
        <div className="flex gap-2 text-[11px]">
          <span className="px-2.5 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-400">
            Base <b className="text-gray-200">{detalle.base}</b>
          </span>
          <span className="px-2.5 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-400">
            Factores <b className="text-emerald-300">+{detalle.bonusFactores}</b>
          </span>
          <span className="px-2.5 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-400">
            Slots <b className="text-sky-300">{filled}/14</b>
          </span>
        </div>
      </div>

      <AptitudPanel arbol={arbol} />

      <div className="overflow-x-auto pb-4">
        <div className="flex flex-col items-center gap-1 p-2 min-w-[760px]">
          {/* Gen 0 */}
          <div className="flex flex-col items-center gap-2 w-full">
            <GenLabel tone="violet">Objetivo · Trainee</GenLabel>
            <Card {...p} pos="objetivo" label="Objetivo" highlight="target" />
            {!arbol.objetivo.personaje && (
              <p className="text-xs text-gray-500 max-w-xs text-center">
                Empieza eligiendo el personaje que vas a entrenar
              </p>
            )}
          </div>

          <Connector />

          {/* Gen 1 */}
          <div className="flex flex-col items-center gap-3 w-full">
            <GenLabel>Legacies · Padres</GenLabel>
            <div className="flex justify-center gap-10 md:gap-20">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-sky-400/80 font-semibold">Lado paterno</span>
                <Card {...p} pos="padre" label="Padre" highlight="paternal" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-pink-400/80 font-semibold">Lado materno</span>
                <Card {...p} pos="madre" label="Madre" highlight="maternal" />
              </div>
            </div>
          </div>

          <Connector />

          {/* Gen 2 */}
          <div className="flex flex-col items-center gap-3 w-full">
            <GenLabel>Sub-legacies · Abuelos</GenLabel>
            <div className="flex justify-center gap-6 flex-wrap">
              <div className="rounded-2xl border border-sky-500/15 bg-sky-500/5 p-3 flex gap-2">
                <Card {...p} pos="abueloPaterno" label="Ab. paterno" highlight="paternal" />
                <Card {...p} pos="abuelaPaterna" label="Ab. paterna" highlight="paternal" />
              </div>
              <div className="rounded-2xl border border-pink-500/15 bg-pink-500/5 p-3 flex gap-2">
                <Card {...p} pos="abueloMaterno" label="Ab. materno" highlight="maternal" />
                <Card {...p} pos="abuelaMaterna" label="Ab. materna" highlight="maternal" />
              </div>
            </div>
          </div>

          <Connector />

          {/* Gen 3 */}
          <div className="flex flex-col items-center gap-3 w-full">
            <button
              type="button"
              onClick={() => setBisabuelosExpanded((v) => !v)}
              aria-expanded={bisabuelosExpanded}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border text-violet-300 bg-violet-500/10 border-violet-500/25 hover:bg-violet-500/20 active:scale-[0.98] transition-all"
            >
              <span className="text-xs leading-none">{bisabuelosExpanded ? '▾' : '▸'}</span>
              3.ª generación · Bisabuelos
              <span className="px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-200 tracking-normal">
                {filledBis}/8
              </span>
            </button>

            {bisabuelosExpanded && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-5xl px-2 animate-fade-in">
              {(
                [
                  { title: 'Padres del Ab. paterno', a: 'bisAbueloPP', b: 'bisAbuelaPP', h: 'paternal' as const },
                  { title: 'Padres de la Ab. paterna', a: 'bisAbueloPM', b: 'bisAbuelaPM', h: 'paternal' as const },
                  { title: 'Padres del Ab. materno', a: 'bisAbueloMP', b: 'bisAbuelaMP', h: 'maternal' as const },
                  { title: 'Padres de la Ab. materna', a: 'bisAbueloMM', b: 'bisAbuelaMM', h: 'maternal' as const },
                ] as const
              ).map((g) => (
                <div
                  key={g.title}
                  className={`rounded-2xl border p-2.5 flex flex-col items-center gap-2 ${
                    g.h === 'paternal'
                      ? 'border-sky-500/15 bg-sky-500/5'
                      : 'border-pink-500/15 bg-pink-500/5'
                  }`}
                >
                  <span className="text-[9px] text-gray-400 font-medium text-center leading-tight">{g.title}</span>
                  <div className="flex gap-1.5">
                    <Card {...p} pos={g.a} label="Bis ♂" compact highlight={g.h} />
                    <Card {...p} pos={g.b} label="Bis ♀" compact highlight={g.h} />
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
