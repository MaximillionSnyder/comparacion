import type { Locale, Personaje } from '../types';

export const DEFAULT_LOCALE: Locale = 'en';

export function getPersonajeNombre(personaje: Personaje, locale: Locale = DEFAULT_LOCALE): string {
  return personaje.nombre[locale] || personaje.nombre[DEFAULT_LOCALE];
}

export function getPersonajeSearchText(personaje: Personaje): string {
  return [personaje.id, ...Object.values(personaje.nombre), ...(personaje.aliases ?? [])].join(' ');
}
