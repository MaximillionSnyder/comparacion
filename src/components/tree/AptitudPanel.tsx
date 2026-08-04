import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAptitudCalc } from '../../hooks/useAptitudCalc';
import { GRADES } from '../../utils/aptitudCalculator';
import type { Arbol } from '../../types';
import type { TipoAptitudResultado } from '../../utils/aptitudCalculator';

function useEsColapsable(): boolean {
  const esApp = Capacitor.isNativePlatform();
  const [esGrande, setEsGrande] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setEsGrande(mq.matches);
    const h = (e: MediaQueryListEvent) => setEsGrande(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return esApp || !esGrande;
}

const colorGrade: Record<number, string> = {
  0: 'text-gray-400 bg-gray-800/60 border-gray-600/40',
  1: 'text-orange-300 bg-orange-500/10 border-orange-400/30',
  2: 'text-amber-300 bg-amber-500/10 border-amber-400/30',
  3: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30',
};

function GradeBadge({ n }: { n: number }) {
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-black border ${colorGrade[n]}`}>
      {GRADES[n]}
    </span>
  );
}

function FilaAptitud({ r }: { r: TipoAptitudResultado }) {
  return (
    <div className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-sm ${r.mejora ? 'bg-rose-500/5' : ''}`}>
      <span className="w-28 truncate text-gray-400 text-xs">{r.label}</span>
      <GradeBadge n={r.base} />
      <span className={`text-xs font-bold ${r.mejora ? 'text-rose-400' : 'text-gray-600'}`}>
        {r.mejora ? '→' : '—'}
      </span>
      <GradeBadge n={r.final} />
      {r.mejora && (
        <span className="text-[10px] text-rose-400/70 ml-auto tabular-nums">
          +{r.subida} · {r.estrellas}★
        </span>
      )}
      {r.final === 3 && !r.mejora && (
        <span className="text-[10px] text-emerald-400/60 ml-auto">máx</span>
      )}
    </div>
  );
}

interface Props {
  arbol: Arbol;
}

export default function AptitudPanel({ arbol }: Props) {
  const colapsable = useEsColapsable();
  const [abierto, setAbierto] = useState(false);
  const { tipos, hayObjetivo } = useAptitudCalc(arbol);

  if (!hayObjetivo) return null;

  const contenido = (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-0.5">
        {tipos.map((r) => (
          <FilaAptitud key={r.tipo} r={r} />
        ))}
      </div>
      <details className="mt-3 text-[11px] text-gray-500">
        <summary className="cursor-pointer hover:text-gray-300 font-semibold">Regla de subida</summary>
        <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-gray-400">
          <span>1–3 estrellas</span><span className="text-gray-300">→ +1 nivel</span>
          <span>4–6 estrellas</span><span className="text-gray-300">→ +2 niveles</span>
          <span>7–9 estrellas</span><span className="text-gray-300">→ +3 niveles</span>
          <span>10+ estrellas</span><span className="text-gray-300">→ +4 niveles</span>
          <span className="col-span-2 mt-1 text-rose-400/70">Tope: A (no alcanza S)</span>
        </div>
      </details>
    </div>
  );

  if (!colapsable) {
    return (
      <div className="mt-4 p-3 rounded-2xl border border-gray-800/60 bg-gray-900/30">
        <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">Aptitud del objetivo</h3>
        {contenido}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-gray-800/60 bg-gray-900/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
      >
        <span>Aptitud del objetivo</span>
        <span className={`transition-transform text-xs ${abierto ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {abierto && <div className="px-4 pb-3">{contenido}</div>}
    </div>
  );
}