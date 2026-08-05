export type Locale = 'es' | 'en' | 'ja';

export interface LocalizedText {
  es: string;
  en: string;
  ja: string;
}

export type TipoFactorAzul = 'speed' | 'stamina' | 'power' | 'guts' | 'wit';

export type TipoFactorRojo =
  | 'turf' | 'dirt'
  | 'sprint' | 'mile' | 'medium' | 'long'
  | 'front' | 'pace' | 'late' | 'end';

export interface FactorAzul {
  tipo: TipoFactorAzul;
  estrellas: 0 | 1 | 2 | 3;
}

export interface FactorRojo {
  tipo: TipoFactorRojo;
  estrellas: 0 | 1 | 2 | 3;
}

export interface FactorVerde {
  nombre: string;
  estrellas: 0 | 1 | 2 | 3;
}

export interface FactoresDefault {
  azul: FactorAzul;
  rojo: FactorRojo;
  verde: FactorVerde;
}

export interface Adaptabilidad {
  turf: 0 | 1 | 2 | 3;
  dirt: 0 | 1 | 2 | 3;
  sprint: 0 | 1 | 2 | 3;
  mile: 0 | 1 | 2 | 3;
  medium: 0 | 1 | 2 | 3;
  long: 0 | 1 | 2 | 3;
  front: 0 | 1 | 2 | 3;
  pace: 0 | 1 | 2 | 3;
  late: 0 | 1 | 2 | 3;
  end: 0 | 1 | 2 | 3;
}

export interface Personaje {
  id: string;
  nombre: LocalizedText;
  aliases?: string[];
  avatarColor: string;
  distancia: 'sprint' | 'mile' | 'medium' | 'long';
  estilo: 'front' | 'pace' | 'late' | 'end';
  adaptabilidad: Adaptabilidad;
  factoresDefault: FactoresDefault;
}

export interface Nodo {
  personaje: Personaje | null;
  factorAzul: FactorAzul;
  factorRojo: FactorRojo;
  factorVerde: FactorVerde;
}

export type PosicionNodo =
  | 'objetivo'
  | 'padre'
  | 'madre'
  | 'abueloPaterno'
  | 'abuelaPaterna'
  | 'abueloMaterno'
  | 'abuelaMaterna'
  | 'bisAbueloPP'
  | 'bisAbuelaPP'
  | 'bisAbueloPM'
  | 'bisAbuelaPM'
  | 'bisAbueloMP'
  | 'bisAbuelaMP'
  | 'bisAbueloMM'
  | 'bisAbuelaMM';

export interface Arbol {
  objetivo: Nodo;
  padre: Nodo;
  madre: Nodo;
  abueloPaterno: Nodo;
  abuelaPaterna: Nodo;
  abueloMaterno: Nodo;
  abuelaMaterna: Nodo;
  bisAbueloPP: Nodo;
  bisAbuelaPP: Nodo;
  bisAbueloPM: Nodo;
  bisAbuelaPM: Nodo;
  bisAbueloMP: Nodo;
  bisAbuelaMP: Nodo;
  bisAbueloMM: Nodo;
  bisAbuelaMM: Nodo;
}

export const POSICIONES_TODAS: PosicionNodo[] = [
  'objetivo', 'padre', 'madre',
  'abueloPaterno', 'abuelaPaterna', 'abueloMaterno', 'abuelaMaterna',
  'bisAbueloPP', 'bisAbuelaPP', 'bisAbueloPM', 'bisAbuelaPM',
  'bisAbueloMP', 'bisAbuelaMP', 'bisAbueloMM', 'bisAbuelaMM',
];

export const POSICIONES_ANCESTROS: PosicionNodo[] = POSICIONES_TODAS.filter((p) => p !== 'objetivo');

export const POSICIONES_ABUELOS: PosicionNodo[] = [
  'abueloPaterno', 'abuelaPaterna', 'abueloMaterno', 'abuelaMaterna',
];

export const POSICIONES_BISABUELOS: PosicionNodo[] = [
  'bisAbueloPP', 'bisAbuelaPP', 'bisAbueloPM', 'bisAbuelaPM',
  'bisAbueloMP', 'bisAbuelaMP', 'bisAbueloMM', 'bisAbuelaMM',
];

export const POS_LABELS: Record<PosicionNodo, string> = {
  objetivo: 'Objetivo',
  padre: 'Padre',
  madre: 'Madre',
  abueloPaterno: 'Ab. paterno',
  abuelaPaterna: 'Ab. paterna',
  abueloMaterno: 'Ab. materno',
  abuelaMaterna: 'Ab. materna',
  bisAbueloPP: 'Bis. PP',
  bisAbuelaPP: 'Bis. PP♀',
  bisAbueloPM: 'Bis. PM',
  bisAbuelaPM: 'Bis. PM♀',
  bisAbueloMP: 'Bis. MP',
  bisAbuelaMP: 'Bis. MP♀',
  bisAbueloMM: 'Bis. MM',
  bisAbuelaMM: 'Bis. MM♀',
};

export type RangoAfinidad = '◎' | '○' | '△' | '-';

export interface ResultadoAfinidad {
  puntuacionTotal: number;
  rango: RangoAfinidad;
  detalle: {
    base: number;
    bonusPadres: number;
    bonusAbuelos: number;
    bonusFactores: number;
  };
}

export const TIPOS_AZUL: { tipo: TipoFactorAzul; label: string }[] = [
  { tipo: 'speed', label: 'Speed (スピード)' },
  { tipo: 'stamina', label: 'Stamina (スタミナ)' },
  { tipo: 'power', label: 'Power (パワー)' },
  { tipo: 'guts', label: 'Guts (根性)' },
  { tipo: 'wit', label: 'Wit (賢さ)' },
];

export const TIPOS_ROJO: { tipo: TipoFactorRojo; label: string }[] = [
  { tipo: 'turf', label: 'Turf' },
  { tipo: 'dirt', label: 'Dirt' },
  { tipo: 'sprint', label: 'Sprint' },
  { tipo: 'mile', label: 'Mile' },
  { tipo: 'medium', label: 'Medium' },
  { tipo: 'long', label: 'Long' },
  { tipo: 'front', label: 'Front' },
  { tipo: 'pace', label: 'Pace' },
  { tipo: 'late', label: 'Late' },
  { tipo: 'end', label: 'End' },
];

export const TIPOS_ROJO_LABEL: Record<TipoFactorRojo, string> = Object.fromEntries(
  TIPOS_ROJO.map(({ tipo, label }) => [tipo, label]),
) as Record<TipoFactorRojo, string>;

export const TIPOS_AZUL_LABEL: Record<TipoFactorAzul, string> = {
  speed: 'Speed',
  stamina: 'Stamina',
  power: 'Power',
  guts: 'Guts',
  wit: 'Wit',
};

export const FACTOR_AZUL_VACIO: FactorAzul = { tipo: 'speed', estrellas: 0 };
export const FACTOR_ROJO_VACIO: FactorRojo = { tipo: 'turf', estrellas: 0 };
export const FACTOR_VERDE_VACIO: FactorVerde = { nombre: '', estrellas: 0 };
