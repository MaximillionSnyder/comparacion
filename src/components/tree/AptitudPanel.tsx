import { useAptitudCalc } from '../../hooks/useAptitudCalc';
import { GRADES } from '../../utils/aptitudCalculator';
import type { Arbol } from '../../types';
import type { TipoAptitudResultado } from '../../utils/aptitudCalculator';

const colorGrade: Record<number, string> = {
  0: 'text-gray-500 bg-gray-800/60 border-gray-600/40',
  1: 'text-gray-400 bg-gray-800/60 border-gray-600/40',
  2: 'text-orange-300 bg-orange-500/10 border-orange-400/25',
  3: 'text-orange-300 bg-orange-500/10 border-orange-400/30',
  4: 'text-amber-300 bg-amber-500/10 border-amber-400/25',
  5: 'text-amber-300 bg-amber-500/10 border-amber-400/30',
  6: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30',
  7: 'text-emerald-200 bg-emerald-500/15 border-emerald-300/40',
};

function GradeBadge({ n }: { n: number }) {
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black border ${colorGrade[n]}`}>
      {GRADES[n]}
    </span>
  );
}

function FilaAptitud({ r }: { r: TipoAptitudResultado }) {
  return (
    <div className={`flex items-center gap-1 rounded-lg ${r.mejora ? 'bg-rose-500/5' : ''}`}>
      <span className="w-16 truncate text-[10px] text-gray-400">{r.label}</span>
      <GradeBadge n={r.base} />
      <span className={`text-[10px] font-bold ${r.mejora ? 'text-rose-400' : 'text-gray-600'}`}>
        {r.mejora ? '→' : '—'}
      </span>
      <GradeBadge n={r.final} />
      {r.mejora && (
        <span className="text-[9px] text-rose-400/70 ml-auto tabular-nums">
          {r.estrellas}★
        </span>
      )}
    </div>
  );
}

interface Props {
  arbol: Arbol;
}

export default function AptitudPanel({ arbol }: Props) {
  const { tipos, hayObjetivo } = useAptitudCalc(arbol);

  if (!hayObjetivo) return null;

  return (
    <div className="rounded-2xl border border-gray-800/60 bg-gray-900/40 p-2.5 min-h-[8.5rem]">
      <h3 className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold mb-1.5 text-center">
        Aptitud del objetivo
      </h3>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {tipos.map((r) => (
          <FilaAptitud key={r.tipo} r={r} />
        ))}
      </div>
      <details className="mt-2 text-[9px] text-gray-500">
        <summary className="cursor-pointer hover:text-gray-300 font-semibold">Regla de subida</summary>
        <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-400">
          <span>1–3 ★</span><span className="text-gray-300">→ +1 nivel</span>
          <span>4–6 ★</span><span className="text-gray-300">→ +2 niveles</span>
          <span>7–9 ★</span><span className="text-gray-300">→ +3 niveles</span>
          <span>10+ ★</span><span className="text-gray-300">→ +4 niveles</span>
          <span className="col-span-2 mt-0.5 text-rose-400/70">Tope: A (no alcanza S)</span>
        </div>
      </details>
    </div>
  );
}