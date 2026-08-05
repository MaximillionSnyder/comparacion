import { useMemo } from 'react';
import AffinityBadge from './AffinityBadge';
import type { Arbol, RangoAfinidad } from '../../types';
import { POSICIONES_ANCESTROS, POS_LABELS } from '../../types';
import { getAffinityScore, getRango } from '../../utils/affinityCalculator';
import { getPersonajeNombre } from '../../utils/characterLabels';

interface AffinityMatrixProps {
  arbol: Arbol;
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

  if (ancestros.length === 0) {
    return (
      <div className="text-center py-16 px-4 animate-fade-in">
        <p className="text-gray-400 font-medium">Aún no hay legacies</p>
        <p className="text-sm text-gray-600 mt-1">
          Añade padres o abuelos en el árbol para comparar afinidades.
        </p>
      </div>
    );
  }

  const getAffinity = (idA: string, idB: string): { puntuacion: number; rango: RangoAfinidad } => {
    if (idA === idB) return { puntuacion: 100, rango: '◎' };
    const p = getAffinityScore(idA, idB);
    return { puntuacion: p, rango: getRango(p) };
  };

  const allChars = [objetivo, ...ancestros.map((a) => a.personaje)];

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
                  const { puntuacion, rango } = getAffinity(rowChar.id, colChar.id);
                  return (
                    <td key={ci} className="p-2.5 border-b border-gray-800/80 text-center">
                      <AffinityBadge rango={rango} puntuacion={puntuacion} />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
