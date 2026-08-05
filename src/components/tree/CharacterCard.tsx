import type { Nodo, PosicionNodo } from '../../types';
import { TIPOS_AZUL_LABEL, TIPOS_ROJO_LABEL } from '../../types';
import { getPersonajeNombre } from '../../utils/characterLabels';

interface CharacterCardProps {
  nodo: Nodo;
  posicion: PosicionNodo;
  label: string;
  compact?: boolean;
  highlight?: 'paternal' | 'maternal' | 'target';
  onSelect: (posicion: PosicionNodo) => void;
  onEditFactor: (posicion: PosicionNodo) => void;
  onClear: (posicion: PosicionNodo) => void;
}

const ringMap = {
  paternal: 'hover:border-sky-500/60 hover:shadow-sky-500/10',
  maternal: 'hover:border-pink-500/60 hover:shadow-pink-500/10',
  target: 'hover:border-violet-500/60 hover:shadow-violet-500/15 border-violet-500/30',
};

export default function CharacterCard({
  nodo, posicion, label, compact, highlight = 'paternal',
  onSelect, onEditFactor, onClear,
}: CharacterCardProps) {
  const { personaje, factorAzul, factorRojo, factorVerde } = nodo;
  const nombre = personaje ? getPersonajeNombre(personaje) : '';
  const iniciales = personaje ? nombre.slice(0, 2).toUpperCase() : '+';
  const tieneFactores =
    factorAzul.estrellas > 0 ||
    factorRojo.estrellas > 0 ||
    (factorVerde.estrellas > 0 && !!factorVerde.nombre);

  const size = compact
    ? {
        card: 'w-[5.5rem] min-h-[5.5rem] p-1.5 gap-0.5',
        avatar: 'w-9 h-9 text-xs',
        name: 'text-[10px]',
        factor: 'text-[8px] px-1 py-0.5',
        btn: 'text-[9px] px-1.5 py-1 min-h-[28px]',
        label: 'text-[9px]',
      }
    : {
        card: 'w-[8.5rem] min-h-[8.5rem] p-2.5 gap-1',
        avatar: 'w-14 h-14 text-lg',
        name: 'text-xs',
        factor: 'text-[10px] px-1.5 py-0.5',
        btn: 'text-[11px] px-2.5 py-1.5 min-h-[34px]',
        label: 'text-[10px]',
      };

  const filledRing = personaje
    ? highlight === 'target'
      ? 'border-violet-500/40 shadow-lg shadow-violet-900/20'
      : highlight === 'maternal'
        ? 'border-pink-500/25'
        : 'border-sky-500/25'
    : 'border-dashed border-gray-600/80 bg-gray-900/40';

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <span className={`${size.label} text-gray-400 font-semibold uppercase tracking-wider`}>
        {label}
      </span>

      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(posicion)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(posicion);
          }
        }}
        className={`relative flex flex-col items-center rounded-2xl cursor-pointer border bg-gray-900/90 backdrop-blur-sm shadow-md transition-all duration-150 hover:scale-[1.04] active:scale-[0.98] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${size.card} ${filledRing} ${ringMap[highlight]}`}
      >
        {personaje ? (
          <>
            <div
              className={`${size.avatar} rounded-full flex items-center justify-center text-white font-bold shadow-inner ring-2 ring-white/10`}
              style={{ backgroundColor: personaje.avatarColor }}
            >
              {iniciales}
            </div>
            <span className={`${size.name} text-gray-100 font-semibold leading-tight text-center line-clamp-2 px-0.5`}>
              {nombre}
            </span>

            {tieneFactores && (
              <div className="flex flex-col gap-0.5 w-full mt-0.5">
                {factorAzul.estrellas > 0 && (
                  <span className={`${size.factor} rounded-md bg-blue-500/15 text-blue-300 border border-blue-400/25 text-center truncate font-medium`}>
                    {TIPOS_AZUL_LABEL[factorAzul.tipo]} {'★'.repeat(factorAzul.estrellas)}
                  </span>
                )}
                {factorRojo.estrellas > 0 && (
                  <span className={`${size.factor} rounded-md bg-rose-500/15 text-rose-300 border border-rose-400/25 text-center truncate font-medium`}>
                    {TIPOS_ROJO_LABEL[factorRojo.tipo]} {'★'.repeat(factorRojo.estrellas)}
                  </span>
                )}
                {!compact && factorVerde.estrellas > 0 && factorVerde.nombre && (
                  <span
                    className={`${size.factor} rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-400/25 text-center truncate font-medium`}
                    title={factorVerde.nombre}
                  >
                    {factorVerde.nombre.slice(0, 12)}{'★'.repeat(factorVerde.estrellas)}
                  </span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditFactor(posicion);
              }}
              className={`${size.btn} w-full rounded-lg bg-violet-600/20 hover:bg-violet-500/40 text-violet-200 border border-violet-500/30 font-semibold transition-colors`}
            >
              {tieneFactores ? 'Factores' : '+ Factores'}
            </button>

            <button
              type="button"
              aria-label="Quitar personaje"
              onClick={(e) => {
                e.stopPropagation();
                onClear(posicion);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-400 text-white text-sm flex items-center justify-center shadow-md transition-colors font-bold leading-none"
            >
              ×
            </button>
          </>
        ) : (
          <>
            <div className={`${size.avatar} rounded-full bg-gray-800/80 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500 text-xl font-light`}>
              +
            </div>
            <span className={`${size.name} text-gray-500 font-medium`}>Elegir</span>
          </>
        )}
      </div>
    </div>
  );
}
