import affinityMatrix from '../data/affinityMatrix.json';
import type { Arbol, PosicionNodo, RangoAfinidad, ResultadoAfinidad } from '../types';
import { POSICIONES_ANCESTROS } from '../types';

const affinityValues = affinityMatrix as Record<string, Record<string, number>>;

export function getAffinityScore(idA: string, idB: string): number {
  const score = affinityValues[idA]?.[idB];
  if (!Number.isFinite(score)) {
    throw new Error(`Missing affinity score for ${idA} -> ${idB}`);
  }
  return score;
}

function bonusFactores(arbol: Arbol, posicion: PosicionNodo): number {
  const target = arbol.objetivo;
  const ancestro = arbol[posicion];
  let bonus = 0;

  if (target.factorAzul.tipo === ancestro.factorAzul.tipo && target.factorAzul.estrellas > 0 && ancestro.factorAzul.estrellas > 0) {
    bonus += Math.min(target.factorAzul.estrellas, ancestro.factorAzul.estrellas) * 7;
  }
  if (target.factorRojo.tipo === ancestro.factorRojo.tipo && target.factorRojo.estrellas > 0 && ancestro.factorRojo.estrellas > 0) {
    bonus += Math.min(target.factorRojo.estrellas, ancestro.factorRojo.estrellas) * 5;
  }
  if (target.factorVerde.estrellas > 0 && ancestro.factorVerde.estrellas > 0) {
    bonus += Math.min(target.factorVerde.estrellas, ancestro.factorVerde.estrellas) * 3;
  }

  return bonus;
}

export function getRango(puntuacion: number): RangoAfinidad {
  if (puntuacion >= 80) return '◎';
  if (puntuacion >= 50) return '○';
  if (puntuacion > 0) return '△';
  return '-';
}

export function calcularAfinidad(arbol: Arbol): ResultadoAfinidad {
  const { objetivo } = arbol;
  if (!objetivo.personaje) {
    return {
      puntuacionTotal: 0,
      rango: '-',
      detalle: { base: 0, bonusPadres: 0, bonusAbuelos: 0, bonusFactores: 0 },
    };
  }

  const targetId = objetivo.personaje.id;

  let baseTotal = 0;
  let bonusFactoresTotal = 0;
  let bonusPadres = 0;
  let bonusAbuelos = 0;
  let ancestrosConPersonaje = 0;

  for (const pos of POSICIONES_ANCESTROS) {
    const nodo = arbol[pos];
    if (!nodo.personaje) continue;
    ancestrosConPersonaje++;

    const basePareja = getAffinityScore(targetId, nodo.personaje.id);
    baseTotal += basePareja;

    const bf = bonusFactores(arbol, pos);
    bonusFactoresTotal += bf;

    if (pos === 'padre' || pos === 'madre') {
      bonusPadres += basePareja + bf;
    } else {
      bonusAbuelos += basePareja + bf;
    }
  }

  const puntuacionTotal = baseTotal + bonusFactoresTotal;
  const promedio = ancestrosConPersonaje > 0 ? puntuacionTotal / ancestrosConPersonaje : 0;
  const rango = ancestrosConPersonaje > 0 ? getRango(promedio) : '-';

  return {
    puntuacionTotal,
    rango,
    detalle: {
      base: baseTotal,
      bonusPadres,
      bonusAbuelos,
      bonusFactores: bonusFactoresTotal,
    },
  };
}
