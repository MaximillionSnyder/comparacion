import { describe, expect, it } from 'vitest';
import characters from '../data/characters.json';
import affinityMatrix from '../data/affinityMatrix.json';
import { CONFLICT_SLOTS } from '../data/pedigreeConfig';
import { getRango } from './affinityCalculator';
import type { Personaje, PosicionNodo } from '../types';

const personajes = characters as Personaje[];
const matrix = affinityMatrix as Record<string, Record<string, number>>;

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

  it('has a complete affinity matrix', () => {
    const ids = personajes.map((personaje) => personaje.id);
    for (const id of ids) {
      expect(Object.keys(matrix[id])).toHaveLength(ids.length);
      expect(matrix[id][id]).toBe(100);
    }
  });
});

describe('affinity ranges', () => {
  it('keeps the documented thresholds', () => {
    expect(getRango(0)).toBe('-');
    expect(getRango(1)).toBe('△');
    expect(getRango(50)).toBe('○');
    expect(getRango(80)).toBe('◎');
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
