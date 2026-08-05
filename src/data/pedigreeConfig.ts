import type { PosicionNodo } from '../types';

export const CONFLICT_SLOTS: Record<PosicionNodo, PosicionNodo[]> = {
  objetivo: ['padre', 'madre'],
  padre: ['objetivo', 'madre', 'abueloPaterno', 'abuelaPaterna', 'bisAbueloPP', 'bisAbuelaPP', 'bisAbueloPM', 'bisAbuelaPM'],
  madre: ['objetivo', 'padre', 'abueloMaterno', 'abuelaMaterna', 'bisAbueloMP', 'bisAbuelaMP', 'bisAbueloMM', 'bisAbuelaMM'],
  abueloPaterno: ['padre', 'abuelaPaterna', 'bisAbueloPP', 'bisAbuelaPP'],
  abuelaPaterna: ['padre', 'abueloPaterno', 'bisAbueloPM', 'bisAbuelaPM'],
  abueloMaterno: ['madre', 'abuelaMaterna', 'bisAbueloMP', 'bisAbuelaMP'],
  abuelaMaterna: ['madre', 'abueloMaterno', 'bisAbueloMM', 'bisAbuelaMM'],
  bisAbueloPP: ['abueloPaterno', 'bisAbuelaPP'],
  bisAbuelaPP: ['abueloPaterno', 'bisAbueloPP'],
  bisAbueloPM: ['abuelaPaterna', 'bisAbuelaPM'],
  bisAbuelaPM: ['abuelaPaterna', 'bisAbueloPM'],
  bisAbueloMP: ['abueloMaterno', 'bisAbuelaMP'],
  bisAbuelaMP: ['abueloMaterno', 'bisAbueloMP'],
  bisAbueloMM: ['abuelaMaterna', 'bisAbuelaMM'],
  bisAbuelaMM: ['abuelaMaterna', 'bisAbueloMM'],
};
