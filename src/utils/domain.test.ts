import { describe, expect, it } from 'vitest';
import characters from '../data/characters.json';
import { CONFLICT_SLOTS } from '../data/pedigreeConfig';
import { afinidadPar, afinidadTriple, getAffinityScore, getRango } from './affinityCalculator';
import type { Personaje, PosicionNodo } from '../types';

const personajes = characters as Personaje[];

describe('domain data', () => {
  it('has unique IDs and localized names', () => {
    const ids = personajes.map((personaje) => personaje.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const personaje of personajes) {
      expect(personaje.nombre.es).toBeTruthy();
      expect(personaje.nombre.en).toBeTruthy();
      expect(personaje.nombre.ja).toBeTruthy();
    }
  });
});

describe('affinity ranges', () => {
  it('keeps the game thresholds', () => {
    expect(getRango(0)).toBe('-');
    expect(getRango(1)).toBe('△');
    expect(getRango(50)).toBe('△');
    expect(getRango(51)).toBe('○');
    expect(getRango(150)).toBe('○');
    expect(getRango(151)).toBe('◎');
  });
});

describe('affinity formula', () => {
  it('gives 0 for the same character (self affinity)', () => {
    const a = personajes[0];
    expect(afinidadPar(a, a)).toBe(0);
    expect(afinidadTriple(a, a, personajes[1])).toBe(0);
    expect(afinidadTriple(a, personajes[1], a)).toBe(0);
  });

  it('is symmetric between two characters', () => {
    const a = personajes[0];
    const b = personajes[1];
    expect(afinidadPar(a, b)).toBe(afinidadPar(b, a));
    expect(getAffinityScore(a.id, b.id)).toBe(afinidadPar(a, b));
  });

  it('awards aptitude groups (7pt each) plus common bonuses', () => {
    const a = personajes[0];
    const c = personajes.find((p) => p.id === 'mcq')!;
    const apts = () => {
      const adapt = [
        ...(Object.keys(a.adaptabilidad) as (keyof typeof a.adaptabilidad)[]),
      ];
      return adapt.filter(
        (k) => a.adaptabilidad[k] >= 2 && c.adaptabilidad[k] >= 2,
      ).length * 7;
    };
    const sameDormBonus = a.afinidad?.dorm && a.afinidad.dorm === c.afinidad?.dorm ? 2 : 0;
    const sameGradeBonus = a.afinidad?.grado && a.afinidad.grado === c.afinidad?.grado ? 2 : 0;
    expect(afinidadPar(a, c)).toBe(apts() + sameDormBonus + sameGradeBonus);
  });

  it('adds the dormitory bonus (+2) for the same non-solo dorm', () => {
    const spe = personajes.find((p) => p.id === 'spe')!;
    const teio = personajes.find((p) => p.id === 'teio')!;
    expect(spe.afinidad?.dorm).toBe('ritto');
    expect(teio.afinidad?.dorm).toBe('ritto');

    const withoutMetadata = { ...spe, afinidad: undefined } as Personaje;
    const withoutMetadataB = { ...teio, afinidad: undefined } as Personaje;
    const diff = afinidadPar(spe, teio) - afinidadPar(withoutMetadata, withoutMetadataB);
    expect(diff).toBe(2);
  });
});

describe('pedigree conflicts', () => {
  it('contains no self-conflicts and keeps the branch rules', () => {
    for (const [position, conflicts] of Object.entries(CONFLICT_SLOTS) as [PosicionNodo, PosicionNodo[]][]) {
      expect(conflicts).not.toContain(position);
    }
    expect(CONFLICT_SLOTS.objetivo).toEqual(['padre', 'madre']);
    expect(CONFLICT_SLOTS.padre).toContain('bisAbueloPP');
    expect(CONFLICT_SLOTS.bisAbueloPP).toContain('abueloPaterno');
  });
});
