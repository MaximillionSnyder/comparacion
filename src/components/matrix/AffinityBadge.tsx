import type { RangoAfinidad } from '../../types';

interface AffinityBadgeProps {
  rango: RangoAfinidad;
  puntuacion?: number;
}

export default function AffinityBadge({ rango, puntuacion }: AffinityBadgeProps) {
  const colorMap: Record<RangoAfinidad, string> = {
    '◎': 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    '○': 'bg-orange-500/20 text-orange-300 border-orange-400/40',
    '△': 'bg-gray-600/30 text-gray-400 border-gray-500/40',
    '-': 'bg-gray-800/50 text-gray-600 border-gray-700/40',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold border ${colorMap[rango]}`}>
      <span>{rango === '-' ? '—' : rango}</span>
      {puntuacion !== undefined && (
        <span className="text-[10px] font-semibold opacity-70 tabular-nums">{puntuacion}</span>
      )}
    </span>
  );
}
