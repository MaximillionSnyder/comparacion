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
    expect(getRango(50)).toBe('○');
    expect(getRango(150)).toBe('◎');
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

  it('scales by the number of shared aptitude groups (7pt each)', () => {
    const a = personajes[0];
    const b = personajes[1];
    const score = afinidadPar(a, b);
    expect(score % 7).toBe(0);
    expect(score).toBeGreaterThanOrEqual(0);
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
