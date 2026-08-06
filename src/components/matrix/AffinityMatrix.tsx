import { useMemo } from 'react';
import type { Arbol } from '../../types';
import { POSICIONES_ANCESTROS, POS_LABELS } from '../../types';
import { getAffinityScore, getRango } from '../../utils/affinityCalculator';
import { getPersonajeNombre } from '../../utils/characterLabels';

interface AffinityMatrixProps {
  arbol: Arbol;
}

function pairColor(score: number): string {
  if (score === 0) return 'bg-gray-800/60 text-gray-600 border-gray-700/40';
  if (score < 21) return 'bg-orange-500/10 text-orange-300 border-orange-400/25';
  if (score < 35) return 'bg-amber-500/10 text-amber-300 border-amber-400/25';
  return 'bg-emerald-500/10 text-emerald-300 border-emerald-400/25';
}

function rangoColor(rango: string): string {
  if (rango === '◎') return 'text-amber-300';
  if (rango === '○') return 'text-orange-300';
  if (rango === '△') return 'text-gray-400';
  return 'text-gray-600';
}

export default function AffinityMatrix({ arbol }: AffinityMatrixProps) {
  const ancestros = useMemo(() => {
    const result: { label: string; personaje: NonNullable<typeof arbol['padre']['personaje']> }[] = [];
    for (const pos of POSICIONES_ANCESTROS) {
      if (arbol[pos].personaje) {
        result.push({ label: POS_LABELS[pos], personaje: arbol[pos].personaje! });
      }
    }
    return result;
  }, [arbol]);

  const objetivo = arbol.objetivo.personaje;

  const allChars = useMemo(() => {
    if (!objetivo) return [];
    return [objetivo, ...ancestros.map((a) => a.personaje)];
  }, [objetivo, ancestros]);

  const maxScore = useMemo(() => {
    let max = 0;
    for (const rowChar of allChars) {
      for (const colChar of allChars) {
        if (rowChar.id === colChar.id) continue;
        const score = getAffinityScore(rowChar.id, colChar.id);
        if (score > max) max = score;
      }
    }
    return max;
  }, [allChars]);

  if (!objetivo) {
    return (
      <div className="text-center py-16 px-4 animate-fade-in">
        <div className="text-4xl mb-3 opacity-40">◎</div>
        <p className="text-gray-400 font-medium">Sin objetivo seleccionado</p>
        <p className="text-sm text-gray-600 mt-1">
          Ve a la pestaña Árbol y elige un personaje objetivo para ver la matriz.
        </p>
      </div>
    );
  }

  if (allChars.length <= 1) {
    return (
      <div className="text-center py-16 px-4 animate-fade-in">
        <p className="text-gray-400 font-medium">Aún no hay legacies</p>
        <p className="text-sm text-gray-600 mt-1">
          Añade padres o abuelos en el árbol para comparar afinidades.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/40 animate-fade-in">
      <table className="w-full text-sm border-collapse min-w-[480px]">
        <thead>
          <tr className="bg-gray-900/80">
            <th className="p-3 border-b border-gray-800 text-left text-gray-500 font-semibold text-[10px] uppercase tracking-wider sticky left-0 bg-gray-900/95">
              Personaje
            </th>
            {allChars.map((c, i) => (
              <th key={i} className="p-3 border-b border-gray-800 text-gray-300 font-medium text-xs whitespace-nowrap">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[11px] ring-2 ring-white/10"
                    style={{ backgroundColor: c.avatarColor }}
                  >
                    {getPersonajeNombre(c).slice(0, 1)}
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold">
                    {i === 0 ? 'Obj' : ancestros[i - 1]?.label ?? ''}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allChars.map((rowChar, ri) => {
            const isObjective = ri === 0;
            const label = isObjective ? 'Objetivo' : ancestros[ri - 1]?.label ?? '';
            return (
              <tr key={ri} className={isObjective ? 'bg-violet-950/30' : 'hover:bg-gray-800/30'}>
                <td className="p-3 border-b border-gray-800/80 sticky left-0 bg-inherit backdrop-blur-sm">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[11px] shrink-0 ring-2 ring-white/10"
                      style={{ backgroundColor: rowChar.avatarColor }}
                    >
                      {getPersonajeNombre(rowChar).slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-gray-100 font-medium truncate max-w-[100px] text-xs">{getPersonajeNombre(rowChar)}</div>
                      <div className="text-[10px] text-gray-500">{label}</div>
                    </div>
                  </div>
                </td>
                {allChars.map((colChar, ci) => {
                  const score = getAffinityScore(rowChar.id, colChar.id);
                  const isDiagonal = rowChar.id === colChar.id;
                  const rango = getRango(score);
                  const isBest = maxScore > 0 && score === maxScore;
                  return (
                    <td key={ci} className="p-2.5 border-b border-gray-800/80 text-center">
                      <span
                        className={`inline-flex items-center justify-center min-w-9 px-2 py-1 rounded-lg text-sm font-bold border tabular-nums ${pairColor(score)} ${isBest ? 'ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/20' : ''}`}
                      >
                        {isDiagonal ? (
                          <span className="text-gray-700 text-xs">—</span>
                        ) : (
                          <span className="flex items-baseline gap-0.5">
                            <span>{score}</span>
                            <span className={`text-[10px] font-normal ${rangoColor(rango)}`}>{rango}</span>
                          </span>
                        )}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="border-t border-gray-800/80 px-4 py-3 flex flex-wrap items-center gap-4 text-[10px] text-gray-500">
        <span className="font-semibold text-gray-400 uppercase tracking-wider">Leyenda</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gray-800/60 border border-gray-700/40 inline-block" />
          Sin afinidad
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-orange-500/10 border border-orange-400/25 inline-block" />
          Baja (&lt;21)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-500/10 border border-amber-400/25 inline-block" />
          Media (&lt;35)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500/10 border border-emerald-400/25 inline-block" />
          Alta (≥35)
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full ring-2 ring-amber-400/60 inline-block" />
          Mejor combinación
        </span>
        <span className="text-gray-600">
          Rangos: ◎ ≥151 · ○ ≥51 · △ &lt;51 · – 0
        </span>
      </div>
    </div>
  );
}
