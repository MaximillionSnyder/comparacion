export type TipoFactorAzul = 'speed' | 'stamina' | 'power' | 'guts' | 'wit';

export type TipoFactorRojo =
  | '芝' | 'ダート'
  | '短距離' | 'マイル' | '中距離' | '長距離'
  | '逃げ' | '先行' | '差し' | '追込';

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
  short: 0 | 1 | 2 | 3;
  mile: 0 | 1 | 2 | 3;
  medium: 0 | 1 | 2 | 3;
  long: 0 | 1 | 2 | 3;
  leader: 0 | 1 | 2 | 3;
  frontrunner: 0 | 1 | 2 | 3;
  betweener: 0 | 1 | 2 | 3;
  chaser: 0 | 1 | 2 | 3;
}

export interface Personaje {
  id: string;
  nombre: string;
  avatarColor: string;
  distancia: 'short' | 'mile' | 'medium' | 'long';
  estilo: 'leader' | 'frontrunner' | 'betweener' | 'chaser';
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
  { tipo: '芝', label: '芝 (Turf)' },
  { tipo: 'ダート', label: 'ダート (Dirt)' },
  { tipo: '短距離', label: '短距離 (Short)' },
  { tipo: 'マイル', label: 'マイル (Mile)' },
  { tipo: '中距離', label: '中距離 (Medium)' },
  { tipo: '長距離', label: '長距離 (Long)' },
  { tipo: '逃げ', label: '逃げ (Leader)' },
  { tipo: '先行', label: '先行 (Frontrunner)' },
  { tipo: '差し', label: '差し (Betweener)' },
  { tipo: '追込', label: '追込 (Chaser)' },
];

export const TIPOS_AZUL_LABEL: Record<TipoFactorAzul, string> = {
  speed: 'Speed',
  stamina: 'Stamina',
  power: 'Power',
  guts: 'Guts',
  wit: 'Wit',
};

export const FACTOR_AZUL_VACIO: FactorAzul = { tipo: 'speed', estrellas: 0 };
export const FACTOR_ROJO_VACIO: FactorRojo = { tipo: '芝', estrellas: 0 };
export const FACTOR_VERDE_VACIO: FactorVerde = { nombre: '', estrellas: 0 };
